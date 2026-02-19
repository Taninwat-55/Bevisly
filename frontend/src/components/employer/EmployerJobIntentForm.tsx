import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !skills.trim()) {
      toast.error("Please fill in both Job Title and Core Skills");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateJobListing(title, skills, companyName);
      
      onGenerated({
        title: title,
        description: data.description,
        requirements: Array.isArray(data.requirements) 
          ? data.requirements.join("\n") 
          : data.requirements,
        proof_tasks: data.proof_tasks.map(task => ({
          ...task,
          id: crypto.randomUUID(),
          ai_tools_allowed: true, // Default
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
    <div className="relative w-full max-w-lg mx-auto">
       <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
       >
          <X size={24} />
       </button>

       <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30 mb-6 group">
            <Sparkles className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 font-display">Let AI build your job post</h2>
          <p className="text-lg text-slate-400">
            Tell us who you need. We'll write the description and create the proof task.
          </p>
       </div>

       <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Job Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior React Developer"
              className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
              autoFocus
            />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-300 ml-1">Core Skills (comma separated)</label>
             <Input
               value={skills}
               onChange={(e) => setSkills(e.target.value)}
               placeholder="e.g. React, TypeScript, Node.js"
               className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
             />
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-500/25 border-0"
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
