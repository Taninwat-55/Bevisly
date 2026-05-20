import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { updateCompanyProfile, updateCompanyName } from "@/lib/api/companies";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Globe, MapPin, Building2, Loader2,
  ExternalLink, ImagePlus, X, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PERKS_LIST } from "@/lib/perks";

// ── Constants ────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  "Tech & Software", "FinTech", "HealthTech", "EdTech", "E-commerce",
  "SaaS", "Media & Entertainment", "Consulting", "Marketing & Advertising",
  "HR & Recruiting", "Other",
];

const COMPANY_SIZE_OPTIONS = ["1–10", "11–50", "51–200", "201–500", "500+"];

const STAGE_OPTIONS = [
  "Pre-seed", "Seed", "Series A", "Series B", "Series C+",
  "Bootstrapped", "Profitable",
];

const BUSINESS_MODEL_OPTIONS = ["B2B", "B2C", "B2B2C", "Marketplace", "SaaS"];

const COUNTRY_OPTIONS = [
  "Denmark", "Sweden", "Norway", "Finland", "Iceland",
  "Germany", "Netherlands", "United Kingdom", "France", "Spain",
  "Belgium", "Switzerland", "Austria", "Poland", "Italy",
  "United States", "Canada", "Other",
];

// ── Sub-components ────────────────────────────────────────────

function SectionCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface,var(--color-bg))] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-bold text-[var(--color-text)] tracking-tight">{title}</h2>
        {description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)]/60 focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent outline-none transition-all";
const textareaCls = `${inputCls} resize-y`;

// ── Main Page ────────────────────────────────────────────────

export default function EmployerCompanyProfile() {
  const { user } = useAuth();
  const { company, loading: companyLoading, refresh: refreshCompany } = useCompany();

  // Identity
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");

  // About
  const [description, setDescription] = useState("");
  const [mission, setMission] = useState("");
  const [culture, setCulture] = useState("");

  // Details
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [stage, setStage] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [businessModel, setBusinessModel] = useState<string[]>([]);

  // Perks
  const [perks, setPerks] = useState<string[]>([]);

  // Photos
  const [teamPhotos, setTeamPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);

  // Populate form from loaded company
  useEffect(() => {
    if (!company) return;
    setCompanyName(company.name || "");
    setWebsite(company.website_url || "");
    setCountry(company.country || "");
    setDescription(company.description || "");
    setMission(company.mission || "");
    setCulture(company.culture || "");
    setIndustry(company.industry || "");
    setCompanySize(company.company_size || "");
    setStage(company.stage || "");
    setFoundedYear(company.founded_year ? String(company.founded_year) : "");
    setBusinessModel(company.business_model || []);
    setPerks(company.perks || []);
    setTeamPhotos(company.team_photos || []);
  }, [company]);

  // ── Handlers ──────────────────────────────────────────────

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (teamPhotos.length >= 3) { toast.error("Maximum 3 photos"); return; }

    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("company-photos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("company-photos").getPublicUrl(path);
      const updated = [...teamPhotos, publicUrl];
      setTeamPhotos(updated);
      if (company?.id) await updateCompanyProfile(company.id, { team_photos: updated });
      await refreshCompany();
      toast.success("Photo added!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async (url: string) => {
    const updated = teamPhotos.filter(p => p !== url);
    setTeamPhotos(updated);
    try {
      if (company?.id) await updateCompanyProfile(company.id, { team_photos: updated });
      await refreshCompany();
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const toggleBusinessModel = (val: string) => {
    setBusinessModel(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const togglePerk = (id: string) => {
    setPerks(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!company?.id || !user) return;
    setSaving(true);
    try {
      await Promise.all([
        updateCompanyName(company.id, companyName),
        updateCompanyProfile(company.id, {
          description: description || null,
          mission: mission || null,
          culture: culture || null,
          website_url: website || null,
          country: country || null,
          industry: industry || null,
          company_size: companySize || null,
          stage: stage || null,
          founded_year: foundedYear ? Number(foundedYear) : null,
          business_model: businessModel.length ? businessModel : null,
          perks: perks.length ? perks : [],
        }),
      ]);
      await refreshCompany();
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────

  if (companyLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-2xl bg-[var(--color-surface-hover)]" />
        ))}
      </div>
    );
  }

  const completenessFields = [
    { key: "logo",     label: "Logo",         filled: !!company?.logo_url },
    { key: "name",     label: "Company name", filled: !!companyName.trim() },
    { key: "about",    label: "About",        filled: !!description.trim() },
    { key: "mission",  label: "Mission",      filled: !!mission.trim() },
    { key: "website",  label: "Website",      filled: !!website.trim() },
    { key: "industry", label: "Industry",     filled: !!industry },
    { key: "stage",    label: "Stage",        filled: !!stage },
    { key: "size",     label: "Team size",    filled: !!companySize },
    { key: "perks",    label: "Perks",        filled: perks.length > 0 },
    { key: "photos",   label: "Team photo",   filled: teamPhotos.length > 0 },
  ];
  const filledCount = completenessFields.filter(f => f.filled).length;
  const completePct = Math.round((filledCount / completenessFields.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Company Profile</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            This is your public employer brand page — what candidates see when they research you.
          </p>
        </div>
        {company?.slug && (
          <a href={`/company/${company.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" type="button">
              <Eye size={14} className="mr-1.5" /> Preview
            </Button>
          </a>
        )}
      </div>

      {completePct < 100 && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Profile {completePct}% complete
            </p>
            <span className="text-xs text-amber-600 dark:text-amber-500">{filledCount}/{completenessFields.length} fields</span>
          </div>
          <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-800/40 mb-3">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${completePct}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {completenessFields.filter(f => !f.filled).map(f => (
              <span key={f.key} className="px-2 py-0.5 rounded-full bg-white dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-700 dark:text-amber-400">
                + {f.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">

        {/* ── Identity ── */}
        <SectionCard title="Company Identity" description="Name, website, and location shown on all job listings.">
          {/* Logo — managed in Settings */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
              {company?.logo_url
                ? <img src={company.logo_url} alt={companyName || "Logo"} className="w-full h-full object-cover" />
                : <Building2 className="w-7 h-7 text-[var(--color-text-muted)]" />}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Company logo</p>
              <Link to="/employer/settings" className="text-xs text-[var(--color-brand-primary)] hover:underline">
                Change logo in Settings →
              </Link>
            </div>
          </div>

          <Field label="Company Name">
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Your company name"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Website">
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
            <Field label="Country">
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <select value={country} onChange={e => setCountry(e.target.value)} className={`${inputCls} pl-9`}>
                  <option value="">Select country…</option>
                  {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── About ── */}
        <SectionCard title="About" description="Tell candidates who you are and what you stand for.">
          <Field label="About the Company" hint="Describe what you build and why it matters.">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="We're building…"
              rows={4}
              className={textareaCls}
            />
          </Field>
          <Field label="Mission Statement">
            <textarea
              value={mission}
              onChange={e => setMission(e.target.value)}
              placeholder="What drives your company…"
              rows={2}
              className={textareaCls}
            />
          </Field>
          <Field label="Culture & Values" hint="Supports markdown — use - for bullet points.">
            <textarea
              value={culture}
              onChange={e => setCulture(e.target.value)}
              placeholder="- We believe in…&#10;- We work with…"
              rows={4}
              className={textareaCls}
            />
          </Field>
        </SectionCard>

        {/* ── Company Details ── */}
        <SectionCard title="Company Details" description="Helps candidates understand your size and context.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Industry">
              <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls}>
                <option value="">Select industry…</option>
                {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Company Size">
              <select value={companySize} onChange={e => setCompanySize(e.target.value)} className={inputCls}>
                <option value="">Select size…</option>
                {COMPANY_SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select value={stage} onChange={e => setStage(e.target.value)} className={inputCls}>
                <option value="">Select stage…</option>
                {STAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Founded Year">
              <input
                type="number"
                value={foundedYear}
                onChange={e => setFoundedYear(e.target.value)}
                placeholder="e.g. 2023"
                min={1900}
                max={new Date().getFullYear()}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Business Model" hint="Select all that apply.">
            <div className="flex flex-wrap gap-2 mt-1">
              {BUSINESS_MODEL_OPTIONS.map(opt => {
                const active = businessModel.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleBusinessModel(opt)}
                    className={[
                      "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                      active
                        ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                        : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Field>
        </SectionCard>

        {/* ── Perks ── */}
        <SectionCard title="Perks & Benefits" description="Click to select what you offer — shown on your brand page.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PERKS_LIST.map(({ id, label, icon: Icon }) => {
              const active = perks.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePerk(id)}
                  className={[
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                    active
                      ? "bg-[var(--color-brand-primary)]/10 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-primary)]/50 hover:text-[var(--color-text)]",
                  ].join(" ")}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Photos ── */}
        <SectionCard title="Team Photos" description="Up to 3 photos shown on your brand page · JPG, PNG · Max 5MB each.">
          <div className="flex flex-wrap gap-3">
            {teamPhotos.map(url => (
              <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-border)] group shrink-0">
                <img src={url} className="w-full h-full object-cover" alt="Team photo" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(url)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {teamPhotos.length < 3 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)] shrink-0 disabled:opacity-50"
              >
                {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                <span className="text-[10px]">Add photo</span>
              </button>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
        </SectionCard>

        {/* ── Save ── */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} isLoading={saving}>
            Save Profile
          </Button>
          {company?.slug && (
            <Link to={`/company/${company.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" type="button">
                <ExternalLink size={14} className="mr-1.5" /> View Public Page
              </Button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
