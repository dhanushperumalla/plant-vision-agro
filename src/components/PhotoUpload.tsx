import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { compressImage, formatFileSize } from "@/lib/imageCompression";

interface PhotoUploadProps {
  onAnalysisResult: (result: any) => void;
}

const PhotoUpload = ({ onAnalysisResult }: PhotoUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [compressedFileSize, setCompressedFileSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setOriginalFileSize(file.size);
      
      // Show file size warning for large files
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Large File Detected",
          description: `Image size: ${formatFileSize(file.size)}. Compressing for faster upload...`,
        });
      }
      
      try {
        setIsCompressing(true);
        
        // Compress the image to under 1MB
        const compressedFile = await compressImage(file, {
          maxSizeKB: 900, // Target 900KB to ensure we stay well under 1MB
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8
        });
        
        setSelectedImage(compressedFile);
        setCompressedFileSize(compressedFile.size);
        
        // Show compression results
        if (compressedFile.size < file.size) {
          const reductionPercent = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
          toast({
            title: "Image Optimized",
            description: `Reduced from ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)} (${reductionPercent}% smaller)`,
          });
        }
        
        // Generate preview from compressed file
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
        
      } catch (error) {
        console.error('Image compression failed:', error);
        toast({
          title: "Compression Failed",
          description: "Using original image. Upload may be slower.",
          variant: "destructive",
        });
        
        // Fallback to original file
        setSelectedImage(file);
        setCompressedFileSize(file.size);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOriginalFileSize(0);
    setCompressedFileSize(0);
  };

  const analyzeImage = async () => {
    if (!selectedImage || !user || !profile) return;

    // Check if user has trials remaining
    if (profile.trials_remaining <= 0) {
      toast({
        title: "No Trials Remaining",
        description: "You've used all your free trials. Please upgrade to continue analyzing plants.",
        variant: "destructive",
      });
      return;
    }

    // Final file size check before upload
    const fileSizeMB = selectedImage.size / (1024 * 1024);
    if (fileSizeMB > 1.5) { // 1.5MB safety buffer
      toast({
        title: "File Too Large",
        description: `Image is ${formatFileSize(selectedImage.size)}. Please try with a smaller image or contact support.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const n8n_url = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      // Debug logging to check if URL is properly loaded
      // console.log('N8N Webhook URL:', n8n_url);
      // console.log('Current origin:', window.location.origin);
      
      if (!n8n_url) {
        throw new Error('N8N webhook URL is not configured. Please check your environment variables.');
      }
      
      // Use different endpoints for development vs production
      let response;
      
      if (import.meta.env.DEV) {
        // Development: Use proxy endpoint to avoid CORS issues
        const webhookPath = n8n_url.replace(/^https?:\/\/[^\/]+/, '');
        const proxyUrl = `/api/n8n${webhookPath}`;
        
        // console.log('Development mode - using proxy:', proxyUrl);
        
        response = await fetch(proxyUrl, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Production: Test API route first
        console.log('Testing API route availability...');
        
        try {
          const testResponse = await fetch('/api/test');
          console.log('Test API response:', testResponse.status);
        } catch (testError) {
          console.error('Test API failed:', testError);
        }
        
        // Production: Use API route to avoid CORS issues
        const apiUrl = '/api/webhook';
        
        console.log('Production mode - using API route:', apiUrl);
        
        response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('N8N webhook error:', response.status, errorText);
        throw new Error(`Failed to analyze image: ${response.status} ${response.statusText}`);
      }

      // Handle response more robustly
      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error('Invalid response format from server');
      }
      
      // Save report to database
      const { error: saveError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          plant_name: result.output.plant_name,
          disease: result.output.disease,
          disease_detected: result.output.disease_detected,
          description: result.output.description,
          prevention: result.output.prevention,
          required_nutrients: result.output.required_nutrients || null,
          recommended_pesticides_or_fertilizers: result.output.recommended_pesticides_or_fertilizers || null,
          stage: result.output.stage || null
        });

      if (saveError) {
        console.error('Error saving report:', saveError);
        throw new Error('Failed to save report');
      }

      // Use trial only after successful analysis and report saving
      const { data: trialUsed, error: trialError } = await supabase.rpc('use_trial', {
        user_uuid: user.id
      });

      if (trialError || !trialUsed) {
        throw new Error('Failed to use trial');
      }

      // Refresh profile to update trials remaining
      await refreshProfile();
      
      onAnalysisResult(result);
      
      toast({
        title: "Analysis Complete!",
        description: `Plant analyzed successfully! You have ${profile.trials_remaining - 1} trials remaining.`,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      let errorMessage = "There was an error analyzing your image. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('N8N webhook URL is not configured')) {
          errorMessage = "Configuration error: N8N webhook URL is missing. Please contact support.";
        } else if (error.message.includes('Failed to analyze image: 413')) {
          errorMessage = "Image too large for server. This has been automatically fixed - please try uploading again.";
        } else if (error.message.includes('Failed to analyze image:')) {
          errorMessage = `Server error: ${error.message}`;
        } else if (error.message.includes('Failed to save report')) {
          errorMessage = "Analysis completed but failed to save results. Please try again.";
        } else if (error.message.includes('Failed to use trial')) {
          errorMessage = "Analysis completed but failed to update trial count. Please refresh and try again.";
        } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
          errorMessage = "Network error: Unable to connect to the analysis service. This might be due to CORS policy or network connectivity issues. Please check your N8N webhook configuration.";
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Plant Disease Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Upload a photo of your plant to get instant disease diagnosis and treatment recommendations
            powered by advanced AI technology.
          </p>
          {profile && (
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🌱 {profile.trials_remaining} free analyses remaining
            </div>
          )}
        </div>

        <Card className="p-8 shadow-lg bg-white border">
          {!imagePreview ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Upload or Capture Photo
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Take a clear photo of the affected plant area for best results
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  size="lg"
                  className="h-14 border-green-500 text-green-600 hover:bg-green-50"
                  disabled={isCompressing}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCameraClick}
                  size="lg"
                  className="h-14 bg-green-600 text-white hover:bg-green-700"
                  disabled={isCompressing}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-5 w-5" />
                      Take Photo
                    </>
                  )}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected crop"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  onClick={removeImage}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center space-y-4">
                {compressedFileSize > 0 && (
                  <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                    📁 File size: {formatFileSize(compressedFileSize)}
                    {originalFileSize > compressedFileSize && (
                      <span className="text-green-600 ml-1">
                        (reduced from {formatFileSize(originalFileSize)})
                      </span>
                    )}
                  </div>
                )}
                <p className="text-gray-600">
                  Ready to analyze your plant photo
                </p>
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Plant"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PhotoUpload;