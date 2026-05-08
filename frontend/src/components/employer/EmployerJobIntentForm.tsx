import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { generateJobListing } from "@/lib/api/ai";
import toast from "react-hot-toast";
import type { EmployerJob, ProofTask } from "@/types";

interface EmployerJobIntentFormProps {
  onClose: () => void;
  onGenerated: (jobData: Partial<EmployerJob & { proof_tasks: ProofTask[] }>) => void;
  companyName: string;
}

export default function EmployerJobIntentForm({
  onClose,
  onGenerated,
  companyName,
}: EmployerJobIntentFormProps) {
  const [rawInput, setRawInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) {
      toast.error("Please paste your job requirements or description.");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateJobListing(rawInput, companyName);
      
      onGenerated({
        title: data.title || "Untitled Job",
        description: data.description,
        requirements: Array.isArray(data.requirements) 
          ? data.requirements.join("\n") 
          : data.requirements,
        proof_tasks: data.proof_tasks.map(task => ({
          ...task,
          id: crypto.randomUUID(),
        })) as ProofTask[],
      });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate job listing. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col justify-center">
       <div className="absolute -top-4 right-0 md:-right-4">
         <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
         >
            <X size={20} />
         </button>
       </div>

       <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-brand-primary)] shadow-lg shadow-blue-500/30 mb-4 group">
            <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 font-display">Let AI build your job post</h2>
          <p className="text-base text-slate-400">
            Paste your rough requirements, a link, or an existing job description. We'll handle the rest.
          </p>
       </div>

       <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. We need a Senior React dev who knows Tailwind and Supabase. Looking for 5+ years experience. Need them to lead the frontend rewrite."
              className="w-full h-40 min-h-[120px] p-4 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-[var(--color-brand-primary)]/50 focus:ring-1 focus:ring-[var(--color-brand-primary)]/50 focus:outline-none resize-y"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full h-12 text-base font-semibold bg-[var(--color-brand-primary)] hover:bg-blue-700 shadow-[var(--shadow-glow-cta)] border-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                Generate Job Listing <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
       </form>
    </div>
  );
}
