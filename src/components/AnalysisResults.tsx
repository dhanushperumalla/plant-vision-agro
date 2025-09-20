import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Leaf, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalysisResultsProps {
  result: {
    output: {
      plant_name: string;
      disease: string;
      disease_detected: boolean;
      description: string;
      prevention: string[];
    };
  };
  onStartOver: () => void;
}

const AnalysisResults = ({ result, onStartOver }: AnalysisResultsProps) => {
  const navigate = useNavigate();

  const analysis = {
    plant: result.output.plant_name,
    disease: result.output.disease,
    diseaseDetected: result.output.disease_detected,
    description: result.output.description,
    cures: result.output.prevention
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={onStartOver}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            Analyze Another Photo
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Analysis Results</h1>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6 text-success" />
            <span className="text-success font-semibold">Analysis Complete</span>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Plant & Disease Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-strong bg-gradient-card border-0">
              <div className="flex items-center space-x-3 mb-4">
                <Leaf className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Plant Identified</h3>
              </div>
              <p className="text-lg text-foreground font-medium">{analysis.plant}</p>
            </Card>

            <Card className="p-6 shadow-strong bg-gradient-card border-0">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <h3 className="text-xl font-semibold text-foreground">Disease Detected</h3>
              </div>
              <Badge variant="destructive" className="text-sm">
                {analysis.disease}
              </Badge>
            </Card>
          </div>

          {/* Description */}
          <Card className="p-8 shadow-strong bg-gradient-card border-0">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Disease Description</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {analysis.description}
            </p>
          </Card>

          {/* Treatment Recommendations */}
          <Card className="p-8 shadow-strong bg-gradient-card border-0">
            <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
              <CheckCircle className="mr-3 h-6 w-6 text-success" />
              Treatment & Prevention
            </h3>
            <div className="space-y-6">
              {analysis.cures.map((cure, index) => {
                const [title, ...description] = cure.split(':');
                return (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2">{title.trim()}</h4>
                      {description.length > 0 && (
                        <p className="text-muted-foreground leading-relaxed">
                          {description.join(':').trim()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onStartOver}
              size="lg"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Analyze Another Crop
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.print()}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Save Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;