import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Leaf, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
const heroImageUrl = "/lovable-uploads/cf1db5c6-3aec-476e-b9a7-6b24759f63ef.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AgroVision</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Diagnose Plant Diseases
                <span className="text-primary"> Instantly</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Upload a photo of your crop and get instant AI-powered disease detection with treatment recommendations. Protect your harvest with cutting-edge technology.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-strong hover:shadow-soft"
                onClick={() => navigate('/analyze')}
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Analysis
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Photo
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <Zap className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">Instant Results</h3>
                <p className="text-sm text-muted-foreground">Get diagnosis in seconds</p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">AI Powered</h3>
                <p className="text-sm text-muted-foreground">Advanced disease detection</p>
              </div>
              <div className="text-center space-y-2">
                <Leaf className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">Save Crops</h3>
                <p className="text-sm text-muted-foreground">Protect your harvest</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <Card className="overflow-hidden shadow-strong bg-gradient-card border-0">
              <img 
                src={heroImageUrl} 
                alt="Indian farmer in green crop field wearing orange turban" 
                className="w-full h-[500px] object-cover"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;