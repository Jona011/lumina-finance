// Mock financial data for the entire application
export interface FinancialRow {
  date: string;
  revenue: number;
  expense: number;
  category: string;
  supplier: string;
  customer: string;
  paymentMethod: string;
  invoiceId: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface Anomaly {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: string;
  date: string;
  confidence: number;
  recommendation: string;
  amount?: number;
}

export interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  confidence: number;
  type: 'growth' | 'risk' | 'optimization' | 'info';
  recommendation?: string;
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  forecast?: number;
  upperBound?: number;
  lowerBound?: number;
}

export const mockMonthlyData: MonthlyData[] = [
  { month: 'Jul', revenue: 42000, expenses: 31000, profit: 11000 },
  { month: 'Aug', revenue: 45000, expenses: 29500, profit: 15500 },
  { month: 'Sep', revenue: 48000, expenses: 33000, profit: 15000 },
  { month: 'Oct', revenue: 51000, expenses: 35000, profit: 16000 },
  { month: 'Nov', revenue: 47000, expenses: 37500, profit: 9500 },
  { month: 'Dec', revenue: 55000, expenses: 38000, profit: 17000 },
  { month: 'Jan', revenue: 52000, expenses: 34000, profit: 18000 },
  { month: 'Feb', revenue: 58000, expenses: 36000, profit: 22000 },
  { month: 'Mar', revenue: 61000, expenses: 39000, profit: 22000 },
  { month: 'Apr', revenue: 59000, expenses: 41000, profit: 18000 },
  { month: 'May', revenue: 64000, expenses: 38500, profit: 25500 },
  { month: 'Jun', revenue: 67000, expenses: 40000, profit: 27000 },
];

export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { name: 'Marketing', value: 156000, percentage: 32, color: 'hsl(239, 84%, 67%)' },
  { name: 'Operations', value: 112000, percentage: 23, color: 'hsl(142, 71%, 45%)' },
  { name: 'Payroll', value: 98000, percentage: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Office', value: 63000, percentage: 13, color: 'hsl(280, 65%, 60%)' },
  { name: 'Software', value: 39000, percentage: 8, color: 'hsl(190, 80%, 50%)' },
  { name: 'Other', value: 19500, percentage: 4, color: 'hsl(215, 20%, 55%)' },
];

export const mockAnomalies: Anomaly[] = [
  {
    id: '1',
    severity: 'high',
    title: 'Marketing spend spike detected',
    description: 'Marketing expenses increased 45% compared to the 3-month average, driven by a $12,400 campaign payment.',
    category: 'Marketing',
    date: '2024-06-15',
    confidence: 94,
    recommendation: 'Review campaign ROI. If CPA exceeds $45, consider pausing underperforming channels.',
    amount: 18600,
  },
  {
    id: '2',
    severity: 'medium',
    title: 'Supplier payment concentration risk',
    description: 'Supplier "TechVendor Pro" now accounts for 44% of all procurement spend, up from 28% last quarter.',
    category: 'Operations',
    date: '2024-06-10',
    confidence: 88,
    recommendation: 'Diversify vendor relationships to reduce single-supplier dependency risk.',
  },
  {
    id: '3',
    severity: 'medium',
    title: 'Unusual off-cycle payment',
    description: 'A $7,200 payment to "Office Solutions Inc" was processed outside normal billing cycles.',
    category: 'Office',
    date: '2024-06-08',
    confidence: 76,
    recommendation: 'Verify this transaction with accounts payable. May indicate duplicate or early payment.',
    amount: 7200,
  },
  {
    id: '4',
    severity: 'low',
    title: 'Cash flow timing shift',
    description: 'Average payment receipt time increased from 18 to 26 days this month.',
    category: 'Revenue',
    date: '2024-06-01',
    confidence: 82,
    recommendation: 'Monitor accounts receivable aging. Consider tightening payment terms for late-paying clients.',
  },
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    icon: '📈',
    title: 'Revenue growing steadily',
    description: 'Revenue has increased 12% compared to last month, maintaining a 4-month upward trend.',
    confidence: 96,
    type: 'growth',
    recommendation: 'Double down on top-performing channels to accelerate growth.',
  },
  {
    id: '2',
    icon: '⚠️',
    title: 'Expense volatility increasing',
    description: 'Month-to-month expense variation has risen 23%, primarily driven by marketing and operations.',
    confidence: 89,
    type: 'risk',
    recommendation: 'Implement budget caps for variable cost categories.',
  },
  {
    id: '3',
    icon: '💡',
    title: 'Office supplies overallocation',
    description: 'Office supplies spending is 32% above benchmarks for businesses of similar size and industry.',
    confidence: 85,
    type: 'optimization',
    recommendation: 'Switch supplier or consolidate purchasing frequency to reduce costs by ~15%.',
  },
  {
    id: '4',
    icon: '🔮',
    title: 'Margin compression warning',
    description: 'If current expense trends continue, profit margin may contract within 60 days.',
    confidence: 78,
    type: 'risk',
    recommendation: 'Review and prioritize cost-cutting measures for non-essential spending.',
  },
  {
    id: '5',
    icon: '🏆',
    title: 'Strong customer concentration',
    description: 'Top 3 customers account for 52% of revenue, creating concentration risk.',
    confidence: 92,
    type: 'info',
    recommendation: 'Expand customer base to reduce dependency on key accounts.',
  },
];

export const mockForecastData: ForecastPoint[] = [
  { month: 'Jan', actual: 52000 },
  { month: 'Feb', actual: 58000 },
  { month: 'Mar', actual: 61000 },
  { month: 'Apr', actual: 59000 },
  { month: 'May', actual: 64000 },
  { month: 'Jun', actual: 67000 },
  { month: 'Jul', forecast: 70500, upperBound: 76000, lowerBound: 65000 },
  { month: 'Aug', forecast: 73000, upperBound: 80000, lowerBound: 66000 },
  { month: 'Sep', forecast: 76000, upperBound: 85000, lowerBound: 67000 },
  { month: 'Oct', forecast: 78500, upperBound: 89000, lowerBound: 68000 },
];

export const mockHealthScore = {
  overall: 82,
  factors: [
    { name: 'Revenue Growth', score: 88, weight: 20, trend: 'up' as const },
    { name: 'Expense Stability', score: 72, weight: 15, trend: 'down' as const },
    { name: 'Cash Flow', score: 85, weight: 20, trend: 'up' as const },
    { name: 'Profitability', score: 90, weight: 20, trend: 'up' as const },
    { name: 'Margin Trend', score: 78, weight: 10, trend: 'stable' as const },
    { name: 'Risk Exposure', score: 74, weight: 15, trend: 'down' as const },
  ],
};

export const kpiData = {
  revenue: { value: 67000, change: 12.3, label: 'Total Revenue', prefix: '$' },
  expenses: { value: 40000, change: -3.8, label: 'Total Expenses', prefix: '$' },
  profit: { value: 27000, change: 22.7, label: 'Net Profit', prefix: '$' },
  healthScore: { value: 82, change: 4, label: 'Health Score', suffix: '/100' },
};
