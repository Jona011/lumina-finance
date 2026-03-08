import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your workspace preferences</p>
      </div>

      {[
        { title: 'Currency', desc: 'Default currency for financial analysis', value: 'USD ($)' },
        { title: 'Date Format', desc: 'Preferred date format for display', value: 'MM/DD/YYYY' },
        { title: 'Fiscal Year Start', desc: 'When your fiscal year begins', value: 'January' },
        { title: 'Industry', desc: 'Used for benchmark comparisons', value: 'Technology / SaaS' },
      ].map(item => (
        <div key={item.title} className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground">{item.value}</span>
        </div>
      ))}

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Data & Privacy</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• Your data is encrypted at rest and in transit</p>
          <p>• Files are processed securely and never shared with third parties</p>
          <p>• You can delete all uploaded data at any time</p>
        </div>
        <button className="mt-4 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
          Delete All Data
        </button>
      </div>
    </div>
  );
}
