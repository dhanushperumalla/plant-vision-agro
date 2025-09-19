import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    if (!selectedImage) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('https://regular-yeti-vaguely.ngrok-free.app/webhook-test/07c6d566-5ee3-4679-ac19-eeba0c9c4adf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      onAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Your crop analysis is ready!",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed", 
        description: "Please try again or check your connection.",
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Analyze Your Crop</h1>
          <p className="text-muted-foreground text-lg">
            Upload or capture a photo of your plant to get instant disease diagnosis
          </p>
        </div>

        <Card className="p-8 shadow-strong bg-gradient-card border-0">
          {!imagePreview ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Upload or Capture Photo
                    </h3>
                    <p className="text-muted-foreground mb-6">
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
                  className="h-14 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>
                <Button
                  onClick={handleCameraClick}
                  size="lg"
                  className="h-14 bg-gradient-primary text-primary-foreground hover:opacity-90"
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
                <p className="text-muted-foreground">
                  Ready to analyze your crop photo
                </p>
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Crop"
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