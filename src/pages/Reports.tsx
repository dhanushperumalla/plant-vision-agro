import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Leaf, AlertTriangle, ChevronLeft } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  plant_name: string;
  disease: string;
  disease_detected: boolean;
  description: string | null;
  prevention: string[];
  image_url: string | null;
  created_at: string;
}

const Reports = () => {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching reports",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-700">Your Analysis Reports</h1>
            <p className="text-gray-600">View your past plant disease analyses</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="h-16 w-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't analyzed any plants yet. Upload your first photo to get started!
              </p>
              <Button onClick={() => navigate('/analyze')}>
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-green-700 flex items-center gap-2">
                        <Leaf className="h-5 w-5" />
                        {report.plant_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(report.created_at)}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={report.disease_detected ? "destructive" : "default"}
                      className="flex items-center gap-1"
                    >
                      {report.disease_detected && <AlertTriangle className="h-3 w-3" />}
                      {report.disease_detected ? "Disease Detected" : "Healthy"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Disease Status</h4>
                    <p className="text-gray-600">{report.disease}</p>
                  </div>

                  {report.description && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                      <p className="text-gray-600">{report.description}</p>
                    </div>
                  )}

                  {report.prevention.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Prevention & Treatment</h4>
                      <ul className="space-y-2">
                        {report.prevention.map((tip, index) => (
                          <li key={index} className="text-gray-600 text-sm">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;