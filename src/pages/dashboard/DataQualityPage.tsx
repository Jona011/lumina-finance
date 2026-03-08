import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

const qualityMetrics = [
  { label: 'Total Rows Processed', value: '2,847', icon: CheckCircle, status: 'good' },
  { label: 'Missing Values', value: '23 (0.8%)', icon: AlertTriangle, status: 'warning' },
  { label: 'Duplicate Rows', value: '5', icon: AlertCircle, status: 'warning' },
  { label: 'Parsing Errors', value: '2', icon: XCircle, status: 'error' },
];

const columnMappings = [
  { original: 'Date Paid', mapped: 'Date', confidence: 98, status: 'auto' },
  { original: 'Rev', mapped: 'Revenue', confidence: 95, status: 'auto' },
  { original: 'Cost', mapped: 'Expense', confidence: 93, status: 'auto' },
  { original: 'Type', mapped: 'Category', confidence: 87, status: 'auto' },
  { original: 'Vendor Name', mapped: 'Supplier', confidence: 91, status: 'auto' },
  { original: 'Client', mapped: 'Customer', confidence: 89, status: 'auto' },
  { original: 'Ref #', mapped: 'Invoice ID', confidence: 82, status: 'review' },
  { original: 'Method', mapped: 'Payment Method', confidence: 78, status: 'review' },
];

export default function DataQualityPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Database className="w-6 h-6 text-primary" /> Data Quality</h1>
        <p className="text-sm text-muted-foreground">Review data parsing, column mappings, and quality metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {qualityMetrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`w-4 h-4 ${m.status === 'good' ? 'text-accent' : m.status === 'warning' ? 'text-warning' : 'text-destructive'}`} />
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
            <p className="text-xl font-bold">{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Column Mappings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Original Column</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Mapped To</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Confidence</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {columnMappings.map((col, i) => (
                <motion.tr key={col.original} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50">
                  <td className="py-3 px-4 font-mono text-xs">{col.original}</td>
                  <td className="py-3 px-4 font-medium">{col.mapped}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${col.confidence >= 90 ? 'bg-accent' : col.confidence >= 80 ? 'bg-warning' : 'bg-destructive'}`}
                          style={{ width: `${col.confidence}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{col.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      col.status === 'auto' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                    }`}>
                      {col.status === 'auto' ? 'Auto-mapped' : 'Needs review'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Category Normalization</h3>
        <div className="space-y-3">
          {[
            { unified: 'Marketing', variants: ['Marketing', 'marketing', 'Ads', 'Advertising', 'Digital Marketing'] },
            { unified: 'Operations', variants: ['Operations', 'Ops', 'operational', 'Operating Costs'] },
            { unified: 'Office Supplies', variants: ['Office', 'Office Supplies', 'office supplies', 'Stationery'] },
          ].map(cat => (
            <div key={cat.unified} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <span className="text-sm font-medium shrink-0 w-32">{cat.unified}</span>
              <div className="flex flex-wrap gap-1.5">
                {cat.variants.map(v => (
                  <span key={v} className="px-2 py-0.5 rounded bg-secondary text-xs text-muted-foreground">{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
