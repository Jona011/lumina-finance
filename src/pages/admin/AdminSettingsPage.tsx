import { Settings, Shield, Database, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Admin Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and management</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Platform</h3>
        <div className="space-y-4">
          {[
            { label: 'Platform Name', value: 'Finora AI' },
            { label: 'Default Plan', value: 'Free' },
            { label: 'Free Upload Limit', value: '1 spreadsheet' },
            { label: 'Free Chat Messages', value: '3 messages' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h3>
        <div className="space-y-4">
          {[
            { label: 'RLS Policies', value: 'Active', status: 'success' },
            { label: 'JWT Authentication', value: 'Enabled', status: 'success' },
            { label: 'API Rate Limiting', value: 'Enabled', status: 'success' },
            { label: 'Data Encryption', value: 'AES-256', status: 'success' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Database</h3>
        <div className="space-y-4">
          {[
            { label: 'Tables', value: '5 (profiles, spreadsheets, chat_messages, api_logs, user_roles)' },
            { label: 'Edge Functions', value: '4 (chat, forecast, anomalies, health-score)' },
            { label: 'AI Model (Chat)', value: 'gemini-2.5-flash' },
            { label: 'AI Model (Analysis)', value: 'gemini-2.5-pro' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm text-right max-w-[60%]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
