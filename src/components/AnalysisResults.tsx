import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Leaf, ArrowLeft, Beaker, Sprout, Calendar, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalysisResultsProps {
  result: {
    output: {
      plant_name: string;
      disease: string;
      disease_detected: boolean;
      description: string;
      prevention: string[];
      required_nutrients?: string;
      recommended_pesticides_or_fertilizers?: string;
      stage?: string;
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

        <div className="grid gap-6">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 shadow-strong bg-gradient-card border-0">
              <div className="flex items-center space-x-3 mb-4">
                <Leaf className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Plant Identified</h3>
              </div>
              <p className="text-xl text-foreground font-bold">{analysis.plant}</p>
            </Card>

            <Card className="p-6 shadow-strong bg-gradient-card border-0">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-foreground">Growth Stage</h3>
              </div>
              <p className="text-xl text-foreground font-bold">
                {result.output.stage || "Not specified"}
              </p>
            </Card>

            <Card className="p-6 shadow-strong bg-gradient-card border-0">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className={`h-6 w-6 ${analysis.diseaseDetected ? 'text-red-600' : 'text-green-600'}`} />
                <h3 className="text-lg font-semibold text-foreground">Health Status</h3>
              </div>
              <Badge variant={analysis.diseaseDetected ? "destructive" : "default"} className="text-sm font-bold">
                {analysis.diseaseDetected ? analysis.disease : "Healthy"}
              </Badge>
            </Card>
          </div>

          {/* Disease Description */}
          {analysis.diseaseDetected && (
            <Card className="p-8 shadow-strong bg-gradient-card border-0">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
                <AlertTriangle className="mr-3 h-6 w-6 text-warning" />
                Disease Information
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {analysis.description}
              </p>
            </Card>
          )}

          {/* Nutritional Requirements */}
          {result.output.required_nutrients && (
            <Card className="p-8 shadow-strong bg-gradient-card border-0">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
                <Beaker className="mr-3 h-6 w-6 text-green-600" />
                Nutritional Requirements
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {result.output.required_nutrients}
              </p>
            </Card>
          )}

          {/* Recommended Treatments */}
          {result.output.recommended_pesticides_or_fertilizers && (
            <Card className="p-8 shadow-strong bg-gradient-card border-0">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
                <Pill className="mr-3 h-6 w-6 text-blue-600" />
                Recommended Treatments
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {result.output.recommended_pesticides_or_fertilizers}
              </p>
            </Card>
          )}

          {/* Prevention & Care Instructions */}
          <Card className="p-8 shadow-strong bg-gradient-card border-0">
            <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
              <Sprout className="mr-3 h-6 w-6 text-green-600" />
              Prevention & Care Instructions
            </h3>
            <div className="space-y-6">
              {analysis.cures.map((prevention, index) => {
                const [title, ...description] = prevention.split(':');
                return (
                  <div key={index} className="flex space-x-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      {description.length > 0 ? (
                        <>
                          <h4 className="font-semibold text-green-900 mb-2">{title.trim()}</h4>
                          <p className="text-green-800 leading-relaxed">
                            {description.join(':').trim()}
                          </p>
                        </>
                      ) : (
                        <p className="text-green-800 leading-relaxed font-medium">
                          {title.trim()}
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