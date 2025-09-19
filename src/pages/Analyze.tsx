import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import AnalysisResults from "@/components/AnalysisResults";

const Analyze = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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