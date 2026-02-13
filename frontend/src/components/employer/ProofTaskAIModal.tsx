import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, Check, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

interface ProofTaskAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (task: { title: string; description: string; expected_time: string }) => void;
  jobTitle: string;
  jobDescription: string;
}

export default function ProofTaskAIModal({
  isOpen,
  onClose,
  onApply,
  jobTitle,
  jobDescription,
}: ProofTaskAIModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    title: string;
    description: string;
    acceptance_criteria: string;
    estimated_duration: string;
  } | null>(null);

  // Auto-generate when modal opens if data is present
  useEffect(() => {
    if (isOpen && !result && !isGenerating && !error) {
      if (!jobTitle || !jobDescription) {
        setError("Please fill in Job Title and Description first.");
        return;
      }
      generateTask();
    }
  }, [isOpen]);

  const generateTask = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Using direct fetch instead of supabase.functions.invoke to debug
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 20000); // 20s timeout
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-proof-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ job_title: jobTitle, job_description: jobDescription }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.title) {
        throw new Error("AI returned empty data. Please try again.");
      }

      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate task";
      console.error("[AI Modal] Error:", err);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    
    onApply({
      title: result.title,
      description: result.description + "\n\n### Acceptance Criteria:\n" + result.acceptance_criteria,
      expected_time: result.estimated_duration
    });
    onClose();
    toast.success("Task applied to form!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2 text-[var(--color-brand-primary)]">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-lg text-[var(--color-text)]">AI Task Generator</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-border)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                <Loader2 className="w-12 h-12 text-[var(--color-brand-primary)] animate-spin relative z-10" />
              </div>
              <div>
                 <p className="text-lg font-medium text-[var(--color-text)]">Generating Challenge...</p>
                 <p className="text-sm text-[var(--color-text-secondary)]">Analyzing job description matching "{jobTitle}"</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isGenerating && error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="font-medium text-sm">Generation Failed</p>
                <p className="text-xs opacity-90">{error}</p>
                <button 
                  onClick={generateTask}
                  className="text-xs underline hover:text-red-400 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Result State */}
          {!isGenerating && !error && result && (
             <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4 space-y-3">
                   <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Task Title</span>
                      <h4 className="text-lg font-medium text-[var(--color-text)] mt-1">{result.title}</h4>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--color-border)]">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Duration</span>
                        <p className="text-[var(--color-text)] text-sm font-medium">{result.estimated_duration}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Instructions Preview</span>
                   <div className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)] max-h-60 overflow-y-auto prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{result.description}</ReactMarkdown>
                      <h5 className="font-bold mt-4 mb-2 text-[var(--color-text)]">Acceptance Criteria</h5>
                      <ReactMarkdown>{result.acceptance_criteria}</ReactMarkdown>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] flex justify-between gap-3 bg-[var(--color-surface)]">
           <button 
             onClick={generateTask}
             disabled={isGenerating}
             className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
           >
             <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
             Regenerate
           </button>
           
           <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleApply}
                disabled={!result || isGenerating}
                className="px-6 py-2 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Check className="w-4 h-4" />
                Use This Task
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
