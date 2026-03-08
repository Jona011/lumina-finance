import { motion } from 'framer-motion';
import { FileText, Download, Share2 } from 'lucide-react';

const reports = [
  { title: 'Executive Summary', desc: 'High-level overview of financial performance, key metrics, and strategic recommendations.', type: 'AI-Generated' },
  { title: 'Monthly Financial Review', desc: 'Detailed month-over-month comparison of revenue, expenses, and profit margins.', type: 'Standard' },
  { title: 'Category Spend Analysis', desc: 'Deep dive into expense categories with benchmarking and optimization suggestions.', type: 'AI-Generated' },
  { title: 'Forecasting Summary', desc: 'Revenue and expense projections with confidence intervals and risk assessment.', type: 'AI-Generated' },
  { title: 'Strategic Advisory Report', desc: 'Comprehensive AI-generated report with growth opportunities and risk mitigation strategies.', type: 'Premium' },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-2xl font-bold mb-1">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and export financial reports</p>
      </div>

      <div className="space-y-4">
        {reports.map((report, i) => (
          <motion.div key={report.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">{report.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    report.type === 'Premium' ? 'bg-warning/10 text-warning' : report.type === 'AI-Generated' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>{report.type}</span>
                </div>
                <p className="text-xs text-muted-foreground">{report.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Export Formats</h3>
        <div className="flex flex-wrap gap-3">
          {['PDF Report', 'CSV Data', 'Excel Workbook', 'Share Link'].map(f => (
            <button key={f} className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border">
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
