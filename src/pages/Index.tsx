import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Camera, FileText, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";

const Index = () => {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">Plant Disease Analyzer</h1>
            </div>
            <Link to="/auth">
              <Button>Sign In / Sign Up</Button>
            </Link>
          </div>
          <Hero />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-700">Plant Disease Analyzer</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              {profile?.full_name || user.email}
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-green-700 mb-4">
            Welcome to Plant Disease Analysis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Get instant AI-powered diagnosis for your plants. Upload photos and receive expert 
            recommendations for treatment and prevention.
          </p>
          {profile && (
            <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-medium mb-8">
              🌱 You have {profile.trials_remaining} free analyses remaining
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/analyze">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">Analyze Plant</CardTitle>
                <CardDescription>
                  Upload a photo of your plant to get instant disease diagnosis and treatment recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">
                  Start Analysis
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/reports">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-700">View Reports</CardTitle>
                <CardDescription>
                  Access your previous plant analysis reports and treatment recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  View History
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose Our Plant Analyzer?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">AI-Powered Analysis</h4>
              <p className="text-gray-600 text-sm">Advanced machine learning for accurate plant disease detection</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 W-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Instant Results</h4>
              <p className="text-gray-600 text-sm">Get diagnosis and treatment recommendations in seconds</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Detailed Reports</h4>
              <p className="text-gray-600 text-sm">Comprehensive analysis with prevention and treatment tips</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
