import BackButton from "@/components/common/BackButton";
import { useState } from "react";
import ContactModal from "@/components/common/ContactModal";

export default function PrivacyPolicy() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">
      {/* ── Fancy Banner / Header ── */}
      <div className="relative py-12 px-8 bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4 mb-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <BackButton to="/" className="mb-6" variant="glass" label="Back to Home" />
          <h1 className="text-4xl font-bold font-display leading-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-blue-100 max-w-xl text-lg opacity-90">
             Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="px-8 max-w-3xl mx-auto">
        <article className="prose dark:prose-invert max-w-none bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-2xl shadow-sm">

          <section className="space-y-6 text-sm leading-relaxed text-[var(--color-text-muted)]">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">1. Introduction</h2>
              <p>
                Welcome to Bevisly ("we," "our," or "us"). We respect your privacy and are committed to protecting
                your personal data. This privacy policy will inform you as to how we look after your personal data
                when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">2. Data We Collect</h2>
              <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address.</li>
                <li><strong>Profile Data:</strong> includes your username, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
                <li><strong>Proof Data:</strong> includes links, files, and text reflections submitted for job applications.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">3. How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To register you as a new customer/candidate.</li>
                <li>To process and deliver your proof submissions to employers.</li>
                <li>To manage our relationship with you (notify you about changes to our terms or privacy policy).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                used or accessed in an unauthorized way, altered or disclosed. Your data is stored securely on Supabase servers located in the EU/US (depending on configuration).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">5. Your Legal Rights (GDPR)</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data (Delete Account option available in Settings).</li>
                <li>Object to processing of your personal data.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">6. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at{" "}
                <button 
                  onClick={() => setIsContactOpen(true)}
                  className="text-[var(--color-candidate)] underline hover:no-underline"
                >
                  bevislyapp@gmail.com
                </button>{" "}
                or use the Feedback button on the site.
              </p>
            </div>
          </section>
        </article>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}