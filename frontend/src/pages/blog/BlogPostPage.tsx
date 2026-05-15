import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/blog";
import BlogPostMeta from "@/components/blog/BlogPostMeta";
import { Button } from "@/components/ui/Button";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-2xl font-bold text-[var(--color-text)]">Article not found</p>
        <Link to="/blog" className="text-[var(--color-brand-primary)] hover:underline flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  const canonicalUrl = `https://bevisly.com/blog/${post.slug}`;
  const ogImage = post.coverImage ? `https://bevisly.com${post.coverImage}` : "https://bevisly.com/logo.png";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedDate ?? post.date,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorTitle,
      url: "https://bevisly.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Bevisly",
      url: "https://bevisly.com",
      logo: {
        "@type": "ImageObject",
        url: "https://bevisly.com/logo.png",
      },
    },
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    ...(post.coverImage ? { image: ogImage } : {}),
  };

  return (
    <>
      <Helmet>
        <title>{post.title} — Bevisly Blog</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.tags.join(", ")} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Bevisly" />
        <meta property="article:published_time" content={post.date} />
        {post.updatedDate && <meta property="article:modified_time" content={post.updatedDate} />}
        <meta property="article:author" content={post.author} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bevisly" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-24">
        {/* Back nav */}
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
        </div>

        {/* Article header */}
        <header className="max-w-3xl mx-auto px-6 pt-8 pb-10">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight text-[var(--color-text)] mb-5">
            {post.title}
          </h1>

          <p className="text-xl text-[var(--color-text-muted)] leading-relaxed mb-8">
            {post.description}
          </p>

          <BlogPostMeta
            author={post.author}
            authorTitle={post.authorTitle}
            authorAvatar={post.authorAvatar}
            date={post.date}
            updatedDate={post.updatedDate}
            readingTime={post.readingTime}
          />

          {post.coverImage && (
            <div className="mt-10 rounded-2xl overflow-hidden aspect-[2/1]">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        {/* Article body */}
        <div className="max-w-3xl mx-auto px-6">
          <article className="prose prose-slate dark:prose-invert max-w-none
            prose-headings:font-display prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[var(--color-text-muted)] prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-[var(--color-brand-primary)] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[var(--color-text)] prose-strong:font-semibold
            prose-ul:my-4 prose-ol:my-4 prose-li:text-[var(--color-text-muted)]
            prose-blockquote:border-l-[var(--color-brand-primary)] prose-blockquote:text-[var(--color-text-muted)] prose-blockquote:italic
            prose-hr:border-[var(--color-border)]
            prose-code:text-[var(--color-brand-primary)] prose-code:bg-[var(--color-brand-primary)]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto px-6 mt-16">
          <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-8 text-center">
            <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-3">
              Ready to try Bevisly?
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              Post your first proof task or build your proof vault — it only takes a few minutes.
            </p>
            <Button onClick={() => (window.location.href = "/auth?tab=signup")}>
              Get started free
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
