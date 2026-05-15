import { Helmet } from "react-helmet-async";
import { getAllPosts } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";

const allPosts = getAllPosts();
const featured = allPosts.find((p) => p.featured) ?? allPosts[0];
const grid = allPosts.filter((p) => p.slug !== featured?.slug);

export default function BlogIndexPage() {
  return (
    <>
      <Helmet>
        <title>Blog — Bevisly</title>
        <meta name="description" content="Insights on proof-of-work hiring, junior talent, and building Bevisly — written by Ice, the founder." />
        <link rel="canonical" href="https://bevisly.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bevisly.com/blog" />
        <meta property="og:title" content="Blog — Bevisly" />
        <meta property="og:description" content="Insights on proof-of-work hiring, junior talent, and building Bevisly." />
        <meta property="og:image" content="https://bevisly.com/logo.png" />
        <meta property="og:site_name" content="Bevisly" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bevisly" />
        <meta name="twitter:title" content="Blog — Bevisly" />
        <meta name="twitter:description" content="Insights on proof-of-work hiring, junior talent, and building Bevisly." />
        <meta name="twitter:image" content="https://bevisly.com/logo.png" />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-20">
        {/* Hero Banner */}
        <div className="relative py-16 px-8 overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center bg-[var(--color-obsidian)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--color-brand-primary)]/20 rounded-full blur-[120px] -z-0" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-0" />
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
              <span className="text-sm font-medium text-white/70">Bevisly Blog</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight mb-4 text-white">
              Insights on{" "}
              <span className="text-[var(--color-brand-primary)]">hiring</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/60 leading-relaxed">
              Thoughts on proof-of-work hiring, junior talent, and building Bevisly — from the founder.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          {allPosts.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-20">More articles coming soon.</p>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <div className="mb-12">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-primary)] mb-4">Featured</p>
                  <BlogCard post={featured} variant="featured" />
                </div>
              )}

              {/* Article grid */}
              {grid.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-6">All articles</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {grid.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
