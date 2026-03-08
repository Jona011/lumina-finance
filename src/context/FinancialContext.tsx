import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { FinancialRow, mockMonthlyData, mockCategoryBreakdown, mockAnomalies, mockInsights, mockForecastData, mockHealthScore, kpiData, MonthlyData, CategoryBreakdown, Anomaly, Insight, ForecastPoint } from '@/lib/mockData';
import { ProcessedFinancials } from '@/lib/parseSpreadsheet';

interface FinancialState {
  hasData: boolean;
  isProcessing: boolean;
  fileName: string | null;
  rawData: FinancialRow[];
  realData: ProcessedFinancials | null;
  setHasData: (v: boolean) => void;
  setIsProcessing: (v: boolean) => void;
  setFileName: (v: string | null) => void;
  setRawData: (v: FinancialRow[]) => void;
  setRealData: (v: ProcessedFinancials | null) => void;
  monthlyData: MonthlyData[];
  categoryBreakdown: CategoryBreakdown[];
  anomalies: Anomaly[];
  insights: Insight[];
  forecastData: ForecastPoint[];
  healthScore: typeof mockHealthScore;
  kpi: typeof kpiData;
  setAnomalies: (v: Anomaly[]) => void;
  setForecastData: (v: ForecastPoint[]) => void;
  setInsights: (v: Insight[]) => void;
}

const FinancialContext = createContext<FinancialState | null>(null);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [hasData, setHasData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawData, setRawData] = useState<FinancialRow[]>([]);
  const [realData, setRealData] = useState<ProcessedFinancials | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [forecastDataState, setForecastData] = useState<ForecastPoint[]>(mockForecastData);
  const [insightsState, setInsights] = useState<Insight[]>(mockInsights);

  // Use real data when available, fall back to mock
  const monthlyData = realData?.monthlyData?.length ? realData.monthlyData : mockMonthlyData;
  const categoryBreakdown = realData?.categoryBreakdown?.length ? realData.categoryBreakdown : mockCategoryBreakdown;

  const computedKpi = realData ? {
    revenue: { value: realData.totalRevenue, change: 12.3, label: 'Total Revenue', prefix: '$' as const },
    expenses: { value: realData.totalExpenses, change: -3.8, label: 'Total Expenses', prefix: '$' as const },
    profit: { value: realData.totalProfit, change: 22.7, label: 'Net Profit', prefix: '$' as const },
    healthScore: { value: 82, change: 4, label: 'Health Score', suffix: '/100' as const },
  } : kpiData;

  return (
    <FinancialContext.Provider value={{
      hasData, isProcessing, fileName, rawData, realData,
      setHasData, setIsProcessing, setFileName, setRawData, setRealData,
      monthlyData,
      categoryBreakdown,
      anomalies,
      insights: insightsState,
      forecastData: forecastDataState,
      healthScore: mockHealthScore,
      kpi: computedKpi,
      setAnomalies,
      setForecastData,
      setInsights,
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
