import * as XLSX from 'xlsx';

export interface ParsedRow {
  [key: string]: string | number | null;
}

export interface ParsedSpreadsheet {
  headers: string[];
  rows: ParsedRow[];
  sheetName: string;
}

export function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: null });
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        resolve({ headers, rows: jsonData, sheetName });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export interface ProcessedFinancials {
  monthlyData: { month: string; revenue: number; expenses: number; profit: number }[];
  categoryBreakdown: { name: string; value: number; percentage: number; color: string }[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
}

const CATEGORY_COLORS = [
  'hsl(239, 84%, 67%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)', 'hsl(190, 80%, 50%)', 'hsl(215, 20%, 55%)',
  'hsl(0, 84%, 60%)', 'hsl(320, 70%, 55%)',
];

function findColumn(headers: string[], keywords: string[]): string | null {
  const lower = headers.map(h => h.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex(h => h.includes(kw));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

export function processFinancialData(parsed: ParsedSpreadsheet): ProcessedFinancials {
  const { headers, rows } = parsed;

  const dateCol = findColumn(headers, ['date', 'month', 'period', 'time']);
  const revenueCol = findColumn(headers, ['revenue', 'income', 'sales', 'credit', 'earning']);
  const expenseCol = findColumn(headers, ['expense', 'cost', 'debit', 'spending', 'payment']);
  const categoryCol = findColumn(headers, ['category', 'type', 'department', 'class', 'group']);

  // Aggregate by month
  const monthMap = new Map<string, { revenue: number; expenses: number }>();
  const categoryMap = new Map<string, number>();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const row of rows) {
    let monthKey = 'Unknown';
    if (dateCol && row[dateCol]) {
      const d = new Date(String(row[dateCol]));
      if (!isNaN(d.getTime())) {
        monthKey = months[d.getMonth()];
      } else {
        // Maybe it's already a month name
        const val = String(row[dateCol]).trim();
        const found = months.find(m => val.toLowerCase().startsWith(m.toLowerCase()));
        if (found) monthKey = found;
      }
    }

    const rev = revenueCol ? Number(row[revenueCol]) || 0 : 0;
    const exp = expenseCol ? Number(row[expenseCol]) || 0 : 0;

    const existing = monthMap.get(monthKey) || { revenue: 0, expenses: 0 };
    monthMap.set(monthKey, {
      revenue: existing.revenue + rev,
      expenses: existing.expenses + exp,
    });

    if (categoryCol && row[categoryCol]) {
      const cat = String(row[categoryCol]);
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp);
    }
  }

  // If no date column, create a single "All Data" entry
  const monthlyData = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      expenses: Math.round(data.expenses),
      profit: Math.round(data.revenue - data.expenses),
    }))
    // Sort by month order
    .sort((a, b) => {
      const ai = months.indexOf(a.month);
      const bi = months.indexOf(b.month);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);

  const categoryBreakdown = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({
      name,
      value: Math.round(value),
      percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

  return {
    monthlyData,
    categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
      { name: 'Uncategorized', value: totalExpenses, percentage: 100, color: CATEGORY_COLORS[0] },
    ],
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
  };
}
