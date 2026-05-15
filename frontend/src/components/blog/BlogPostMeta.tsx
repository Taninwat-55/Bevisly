import { Clock } from "lucide-react";

interface BlogPostMetaProps {
  author: string;
  authorTitle: string;
  authorAvatar: string;
  date: string;
  updatedDate?: string;
  readingTime: number;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}

export default function BlogPostMeta({ author, authorTitle, authorAvatar, date, updatedDate, readingTime }: BlogPostMetaProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <img src={authorAvatar} alt={author} className="w-9 h-9 rounded-full object-cover shrink-0" />
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-sm text-[var(--color-text-muted)]">
          <span className="font-medium text-[var(--color-text)]">{author}</span>
          {authorTitle && (
            <>
              <span className="opacity-40">·</span>
              <span>{authorTitle}</span>
            </>
          )}
          <span className="opacity-40">·</span>
          <span>{formatDate(date)}</span>
          <span className="opacity-40">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime} min read
          </span>
        </div>
      </div>
      {updatedDate && (
        <p className="text-xs text-[var(--color-text-muted)] pl-12 opacity-70">
          Updated {formatDate(updatedDate)}
        </p>
      )}
    </div>
  );
}
