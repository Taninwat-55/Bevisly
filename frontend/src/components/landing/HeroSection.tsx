import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile =
      typeof window !== "undefined" &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/jobs?query=${encodeURIComponent(search.trim())}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* 🎥 Background */}
      {!isMobile ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/thumbnail.jpg"
        >
          <source src="/hiring.mp4" type="video/mp4" />
        </video>
      ) : (
        <img
          src="/thumbnail.jpg"
          alt="Hiring background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 🌫️ Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />

      {/* 🧠 Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
        >
          <span className="block text-[var(--color-candidate)]">
            Proof replaces promise.
          </span>
          <span className="block mt-1 text-white">
            Fair, fast, and verifiable hiring for emerging talent.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base md:text-lg font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
        >
          Candidates prove real skills through short, verified work.  
          Employers discover top talent in hours — not weeks.
        </motion.p>

        {/* 🔍 Search */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-xl mx-auto mt-10 mb-6"
        >
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, categories, or skills..."
            className="w-full rounded-[var(--radius-button)] border border-white/30 bg-white/10 backdrop-blur-md text-white placeholder:text-gray-300 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-candidate)]"
          />
        </form>

        {/* 🏷️ Quick Categories */}
        <div className="flex flex-wrap justify-center gap-3 text-sm mb-10">
          {["Frontend", "UI/UX", "Marketing", "Data", "Writing"].map((cat) => (
            <button
              key={cat}
              onClick={() =>
                navigate(`/jobs?category=${encodeURIComponent(cat)}`)
              }
              className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10 text-gray-100 hover:bg-[var(--color-candidate)] hover:text-white transition"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🚀 CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/auth?role=candidate"
            className="rounded-[var(--radius-button)] px-5 py-3 bg-[var(--color-candidate)] text-white hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            Create my Proof Profile
          </Link>
          <Link
            to="/auth?role=employer"
            className="rounded-[var(--radius-button)] px-5 py-3 bg-[var(--color-employer)] text-white hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            Post a Role
          </Link>
        </motion.div>

        {/* 🌍 Trust strip */}
        {/* <p className="mt-10 text-xs text-white/60">
          Trusted by startups like <span className="font-semibold">Trailr.ai</span>,{" "}
          <span className="font-semibold">Looply</span>, and{" "}
          <span className="font-semibold">DesignBuddy</span>.
        </p> */}
      </div>
    </section>
  );
}