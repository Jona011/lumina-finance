import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, Brain, ArrowLeft, Lock } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { parseSpreadsheetFile, processFinancialData } from '@/lib/parseSpreadsheet';
import UpgradeModal from '@/components/UpgradeModal';
import { toast } from 'sonner';

const processingSteps = [
  'Reading sheets...',
  'Identifying financial columns...',
  'Normalizing dates and amounts...',
  'Detecting categories and transaction types...',
  'Building financial model...',
  'Generating insights and forecasts...',
];

export default function UploadPage() {
  const navigate = useNavigate();
  const { setHasData, setFileName, setIsProcessing: setGlobalProcessing, setRealData, setRawData } = useFinancial();
  const { user, canUploadMore, incrementUploads } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const processFile = useCallback(async (f: File) => {
    if (!canUploadMore()) {
      setShowUpgrade(true);
      return;
    }
    setFile(f);
    setIsProcessing(true);
    setGlobalProcessing(true);
    setCurrentStep(0);

    try {
      // Step 1: Parse file
      setCurrentStep(0);
      const parsed = await parseSpreadsheetFile(f);

      // Step 2: Identify columns
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 400));

      // Step 3: Normalize
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 400));

      // Step 4: Process data
      setCurrentStep(3);
      const processed = processFinancialData(parsed);
      await new Promise(r => setTimeout(r, 400));

      // Step 5: Build model
      setCurrentStep(4);

      // Save to database
      if (user) {
        const { error } = await supabase.from('spreadsheets').insert({
          user_id: user.id,
          file_name: f.name,
          raw_data: parsed.rows as any,
          processed_data: processed as any,
        });
        if (error) console.error('Save error:', error);
      }

      await new Promise(r => setTimeout(r, 400));

      // Step 6: Generate insights
      setCurrentStep(5);
      await new Promise(r => setTimeout(r, 600));

      // Apply data
      setRealData(processed);
      setRawData(parsed.rows as any);
      setFileName(f.name);
      setHasData(true);
      incrementUploads();
      setIsProcessing(false);
      setGlobalProcessing(false);
      toast.success('Spreadsheet processed successfully!');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      console.error('Parse error:', err);
      toast.error('Failed to parse spreadsheet. Please check the file format.');
      setIsProcessing(false);
      setGlobalProcessing(false);
    }
  }, [navigate, setFileName, setHasData, setGlobalProcessing, setRealData, setRawData, canUploadMore, incrementUploads, user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const canUpload = canUploadMore();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Upload your financial data</h1>
          <p className="text-muted-foreground">Drag and drop your Excel or CSV file to get started</p>
        </div>

        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!canUpload ? (
                <div className="glass-card p-12 text-center border border-warning/30">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-warning" />
                  <p className="text-lg font-medium mb-2">Upload limit reached</p>
                  <p className="text-sm text-muted-foreground mb-6">You've reached your free upload limit. Upgrade to add more spreadsheets.</p>
                  <button onClick={() => setShowUpgrade(true)}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all glow-primary">
                    Upgrade to Pro
                  </button>
                </div>
              ) : (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'hover:border-primary/30'}`}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-lg font-medium mb-2">Drop your spreadsheet here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                      <span className="px-3 py-1 rounded-full bg-secondary">.xlsx</span>
                      <span className="px-3 py-1 rounded-full bg-secondary">.csv</span>
                      <span className="px-3 py-1 rounded-full bg-secondary">.xls</span>
                    </div>
                    <input id="file-input" type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFileSelect} />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-accent" />
                    Your files are encrypted and processed securely
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium truncate">{file?.name}</span>
              </div>
              <div className="space-y-3">
                {processingSteps.map((step, i) => (
                  <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm">
                    {i < currentStep ? (
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                    ) : i === currentStep ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                    )}
                    <span className={i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div className="h-full rounded-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
