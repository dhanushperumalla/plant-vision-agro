import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

interface PhotoUploadProps {
  onAnalysisResult: (result: any) => void;
}

const PhotoUpload = ({ onAnalysisResult }: PhotoUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // Use trial first
      const { data: trialUsed, error: trialError } = await supabase.rpc('use_trial', {
        user_uuid: user.id
      });

      if (trialError || !trialUsed) {
        throw new Error('Failed to use trial');
      }

      const response = await fetch('https://regular-yeti-vaguely.ngrok-free.app/webhook-test/07c6d566-5ee3-4679-ac19-eeba0c9c4adf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      
      // Save report to database
      const { error: saveError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          plant_name: result.output.plant_name,
          disease: result.output.disease,
          disease_detected: result.output.disease_detected,
          description: result.output.description,
          prevention: result.output.prevention
        });

      if (saveError) {
        console.error('Error saving report:', saveError);
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
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your image. Please try again.",
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
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>
                <Button
                  onClick={handleCameraClick}
                  size="lg"
                  className="h-14 bg-green-600 text-white hover:bg-green-700"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
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