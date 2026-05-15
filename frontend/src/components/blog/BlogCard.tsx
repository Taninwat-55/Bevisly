import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "featured";
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

export default function BlogCard({ post, variant = "default" }: BlogCardProps) {
  if (variant === "featured") {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group block glass-panel rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/40 transition-colors overflow-hidden"
      >
        {post.coverImage && (
          <div className="aspect-[2/1] overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          </div>
        )}
        <div className="p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-[var(--color-text)] mb-3 group-hover:text-[var(--color-brand-primary)] transition-colors">
            {post.title}
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-6 line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{post.author}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-brand-primary)] group-hover:gap-2 transition-all">
              Read article <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col glass-panel rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/40 transition-colors overflow-hidden"
    >
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--color-brand-primary)] transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2 flex-1 mb-4">
          {post.description}
        </p>
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mt-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime} min read</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
