import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FinancialRow, mockMonthlyData, mockCategoryBreakdown, mockAnomalies, mockInsights, mockForecastData, mockHealthScore, kpiData } from '@/lib/mockData';

interface FinancialState {
  hasData: boolean;
  isProcessing: boolean;
  fileName: string | null;
  rawData: FinancialRow[];
  setHasData: (v: boolean) => void;
  setIsProcessing: (v: boolean) => void;
  setFileName: (v: string | null) => void;
  setRawData: (v: FinancialRow[]) => void;
  monthlyData: typeof mockMonthlyData;
  categoryBreakdown: typeof mockCategoryBreakdown;
  anomalies: typeof mockAnomalies;
  insights: typeof mockInsights;
  forecastData: typeof mockForecastData;
  healthScore: typeof mockHealthScore;
  kpi: typeof kpiData;
}

const FinancialContext = createContext<FinancialState | null>(null);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [hasData, setHasData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawData, setRawData] = useState<FinancialRow[]>([]);

  return (
    <FinancialContext.Provider value={{
      hasData, isProcessing, fileName, rawData,
      setHasData, setIsProcessing, setFileName, setRawData,
      monthlyData: mockMonthlyData,
      categoryBreakdown: mockCategoryBreakdown,
      anomalies: mockAnomalies,
      insights: mockInsights,
      forecastData: mockForecastData,
      healthScore: mockHealthScore,
      kpi: kpiData,
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
