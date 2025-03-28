"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface EvaluationScores {
  codeQuality: number;
  typeUsage: number;
  errorHandling: number;
  codeStructure: number;
  documentation: number;
  security: number;
  performance: number;
  overallScore: number;
  codeCoverage: number;
}

interface CodeQualityMetrics {
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  codeSmells: number;
  complexityDistribution: {
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
  };
  averageFileSize: number;
}

interface SecurityMetrics {
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityHotspots: number;
  authenticationCoverage: number;
  dependencyVulnerabilities: number;
  secureCodePractices: number;
}

interface EvaluationData {
  scores: EvaluationScores;
  metrics: {
    totalFiles: number;
    totalLines: number;
    commentRatio: number;
    complexity: number;
    duplication: number;
  };
  codeQualityMetrics: CodeQualityMetrics;
  securityMetrics: SecurityMetrics;
  improvementTips: string[];
}

type EvaluationContextType = {
  evaluationData: EvaluationData | null;
  setEvaluationData: (data: EvaluationData | null) => void;
};

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);

  return (
    <EvaluationContext.Provider value={{ evaluationData, setEvaluationData }}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
} 