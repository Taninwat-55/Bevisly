export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedDate?: string;
  author: string;
  authorTitle: string;
  authorAvatar: string;
  coverImage?: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  content: string;
}

// Minimal browser-safe frontmatter parser — no Node.js Buffer dependency.
// Handles the subset of YAML used in our blog markdown files.
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, unknown> = {};

  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    if (!key) continue;
    const raw = line.slice(colonIdx + 1).trim();

    if (raw.startsWith("[")) {
      // Inline array: ["a", "b"] or [a, b]
      data[key] = raw
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (raw === "true") {
      data[key] = true;
    } else if (raw === "false") {
      data[key] = false;
    } else {
      const stripped = raw.replace(/^["']|["']$/g, "");
      const num = Number(stripped);
      data[key] = stripped !== "" && !isNaN(num) ? num : stripped;
    }
  }

  return { data, content: match[2] ?? "" };
}

const modules = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parsePost(filepath: string, raw: string): BlogPost {
  const { data, content } = parseFrontmatter(raw);
  const slug = (data.slug as string | undefined) ?? filepath.split("/").pop()!.replace(".md", "");
  return {
    slug,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    date: (data.date as string) ?? "",
    updatedDate: data.updatedDate as string | undefined,
    author: (data.author as string) ?? "Bevisly Team",
    authorTitle: (data.authorTitle as string) ?? "",
    authorAvatar: (data.authorAvatar as string) ?? "/logo.png",
    coverImage: data.coverImage as string | undefined,
    tags: (data.tags as string[]) ?? [],
    readingTime: (data.readingTime as number) ?? 5,
    featured: (data.featured as boolean) ?? false,
    content,
  };
}

let _posts: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_posts) return _posts;
  _posts = Object.entries(modules)
    .map(([filepath, raw]) => parsePost(filepath, raw))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return _posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
