import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, Brain, ArrowLeft } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';

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
  const { setHasData, setFileName, setIsProcessing: setGlobalProcessing } = useFinancial();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setIsProcessing(true);
    setGlobalProcessing(true);
    setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= processingSteps.length) {
        clearInterval(interval);
        setFileName(f.name);
        setHasData(true);
        setIsProcessing(false);
        setGlobalProcessing(false);
        setTimeout(() => navigate('/dashboard'), 600);
      } else {
        setCurrentStep(step);
      }
    }, 900);
  }, [navigate, setFileName, setHasData, setGlobalProcessing]);

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
    </div>
  );
}
