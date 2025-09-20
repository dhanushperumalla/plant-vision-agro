import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PhotoUpload from "@/components/PhotoUpload";
import AnalysisResults from "@/components/AnalysisResults";

const Analyze = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult(result);
  };

  const handleStartOver = () => {
    setAnalysisResult(null);
  };

  return (
    <>
      {!analysisResult ? (
        <PhotoUpload onAnalysisResult={handleAnalysisResult} />
      ) : (
        <AnalysisResults result={analysisResult} onStartOver={handleStartOver} />
      )}
    </>
  );
};

export default Analyze;