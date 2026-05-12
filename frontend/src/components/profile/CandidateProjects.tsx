import { useState, useEffect } from "react";
import { Plus, Link as Edit, Trash2, FolderGit2, Loader2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  getCandidateProjects,
  addCandidateProject,
  updateCandidateProject,
  deleteCandidateProject,
  type CandidateProject
} from "@/lib/api/projects";
import { motion } from "framer-motion";

interface CandidateProjectsProps {
  userId: string;
  isOwner: boolean;
}

export default function CandidateProjects({ userId, isOwner }: CandidateProjectsProps) {
  const [projects, setProjects] = useState<CandidateProject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CandidateProject | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const data = await getCandidateProjects(userId);
        setProjects(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProjects();
    }
  }, [userId]);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: CandidateProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteCandidateProject(id);
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };

  const handleSave = async (projectData: Omit<CandidateProject, "id" | "user_id" | "created_at">) => {
    try {
      if (editingProject) {
        const updated = await updateCandidateProject(editingProject.id, projectData);
        setProjects(projects.map(p => p.id === updated.id ? updated : p));
        toast.success("Project updated");
      } else {
        const added = await addCandidateProject(projectData);
        setProjects([added, ...projects]);
        toast.success("Project added");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project");
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-md flex items-center gap-2 text-[var(--color-text)] font-semibold">
          <FolderGit2 size={20} className="text-pink-500" /> Projects
        </h2>
        {isOwner && (
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus size={16} />}>
            Add Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg)]/50">
          <FolderGit2 size={32} className="mx-auto text-[var(--color-text-muted)] opacity-40 mb-3" />
          <p className="text-[var(--color-text-muted)] text-sm mb-4">No projects added yet.</p>
          {isOwner && (
            <Button size="sm" onClick={handleOpenAdd}>
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden flex flex-col hover:border-[var(--color-border-strong)] transition-colors">
              {project.thumbnail_url ? (
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-[var(--color-border)]">
                  <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-[var(--color-border)]">
                  <FolderGit2 size={32} className="text-[var(--color-text-muted)] opacity-20" />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 flex items-center justify-between">
                  {project.title}
                  {project.link_url && (
                    <a href={project.link_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </h3>
                
                {project.description && (
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-4">
                    {project.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 flex flex-wrap gap-1.5">
                  {project.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {isOwner && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md p-1.5 rounded-xl">
                  <button onClick={() => handleOpenEdit(project)} className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 text-red-300 hover:bg-red-500/50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProject}
      />
    </div>
  );
}

// --- Internal Modal Component ---
function ProjectFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: Omit<CandidateProject, "id" | "user_id" | "created_at">) => Promise<void>;
  initialData: CandidateProject | null;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setLinkUrl(initialData.link_url || "");
        setThumbnailUrl(initialData.thumbnail_url || "");
        setSkillsStr(initialData.skills.join(", "));
      } else {
        setTitle("");
        setDescription("");
        setLinkUrl("");
        setThumbnailUrl("");
        setSkillsStr("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    setSaving(true);
    try {
      const skills = skillsStr.split(",").map(s => s.trim()).filter(s => s);
      await onSave({
        title,
        description,
        link_url: linkUrl,
        thumbnail_url: thumbnailUrl,
        skills
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-[var(--color-text)]">
            {initialData ? "Edit Project" : "Add Project"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-xl text-[var(--color-text-muted)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Title *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. E-commerce Dashboard"
              required
            />
            
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none"
                placeholder="What did you build and why?"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Project Link (URL)"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
              <Input
                label="Thumbnail Image URL"
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="https://imgur.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Skills Used (comma separated)</label>
              <input
                type="text"
                value={skillsStr}
                onChange={e => setSkillsStr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                placeholder="React, Tailwind, Node.js"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button form="project-form" type="submit" isLoading={saving}>Save Project</Button>
        </div>
      </motion.div>
    </div>
  );
}
