"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type EvaluationContextType = {
  evaluationData: any;
  setEvaluationData: (data: any) => void;
};

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [evaluationData, setEvaluationData] = useState<any>(null);

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