import BackButton from "@/components/common/BackButton";
import { useState } from "react";
import ContactModal from "@/components/common/ContactModal";

const LAST_UPDATED = "May 2026";

export default function PrivacyPolicy() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">
      <div className="relative py-12 px-8 bg-[var(--color-brand-primary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4 mb-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <BackButton to="/" className="mb-6" variant="glass" label="Back to Home" />
          <h1 className="text-4xl font-bold font-display leading-tight mb-2">Privacy Policy</h1>
          <p className="text-blue-100 max-w-xl text-lg opacity-90">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="px-8 max-w-3xl mx-auto">
        <article className="prose dark:prose-invert max-w-none bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-2xl shadow-sm">
          <section className="space-y-6 text-sm leading-relaxed text-[var(--color-text-muted)]">

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">1. Introduction</h2>
              <p>
                Welcome to Bevisly ("we," "our," or "us"). We are a recruitment platform operated from Denmark and are
                subject to the EU General Data Protection Regulation (GDPR) and the Danish Data Protection Act.
                This policy explains how we collect, use, and protect your personal data, and what rights you have.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">2. Data We Collect</h2>
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Identity Data:</strong> name, username, and profile photo.</li>
                <li><strong>Contact Data:</strong> email address.</li>
                <li><strong>Professional Data:</strong> CV/resume, skills, work status, LinkedIn/GitHub URLs, and portfolio links.</li>
                <li><strong>Proof Submissions:</strong> files, links, and written responses submitted for job applications.</li>
                <li><strong>Usage Data:</strong> session activity and feature usage for platform improvement.</li>
                <li><strong>Consent Records:</strong> timestamp and version of the Terms of Service you accepted.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">3. How We Use Your Data</h2>
              <p>We process your data on the following legal bases:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Contract performance:</strong> to create and manage your account, process proof submissions, and connect candidates with employers.</li>
                <li><strong>Legitimate interest:</strong> to improve platform safety, detect abuse, and maintain service quality.</li>
                <li><strong>Legal obligation:</strong> to comply with applicable laws and respond to legal requests.</li>
                <li><strong>Consent:</strong> to send marketing communications (you may withdraw consent at any time in Settings).</li>
              </ul>
              <p className="mt-2">
                We do not sell your personal data to third parties. We do not use your data for automated
                advertising profiling.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">4. AI Processing and Automated Systems</h2>
              <p>
                Bevisly uses AI tools to assist in certain platform features. Under GDPR Article 22, we are
                required to disclose any automated processing that produces significant effects on individuals.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>AI feedback assistance:</strong> When an employer reviews your proof submission, an AI tool
                  (powered by Google Gemini) may generate a suggested feedback summary to assist the reviewer.
                  This suggestion is advisory only — the employer always makes the final decision. You are
                  notified of this at the point of submission.
                </li>
                <li>
                  <strong>Practice task grading:</strong> Practice tasks are graded automatically by AI to provide
                  you with instant feedback. These grades contribute to your Bevisly Score.
                </li>
                <li>
                  <strong>Bevisly Score:</strong> Your Bevisly Score is computed automatically from employer ratings
                  and AI-graded practice tasks. This score is used for public ranking and employer visibility.
                  It is not used as the sole basis for any hiring decision.
                </li>
                <li>
                  <strong>Job listing generation:</strong> Employers may use AI assistance to draft job descriptions.
                  Candidate data is not used as input for this feature.
                </li>
              </ul>
              <p className="mt-2">
                <strong>Your rights regarding automated processing:</strong> You have the right to request human
                review of any AI-influenced assessment, to express your point of view, and to contest automated
                outcomes. To exercise this right, contact us at{" "}
                <button onClick={() => setIsContactOpen(true)} className="text-[var(--color-brand-primary)] underline hover:no-underline">hello@bevisly.com</button>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">5. Data Processors and Third Parties</h2>
              <p>
                We share your data with the following third-party processors who are contractually bound to
                process data only on our instructions and in accordance with GDPR:
              </p>
              <div className="mt-3 space-y-3">
                {[
                  {
                    name: "Supabase Inc.",
                    purpose: "Database hosting, authentication, and file storage",
                    data: "All user data including profile, submissions, and files",
                    location: "EU (Frankfurt) and US",
                    link: "https://supabase.com/privacy",
                  },
                  {
                    name: "Resend Inc.",
                    purpose: "Transactional email delivery",
                    data: "Email address, name, and notification content",
                    location: "US (EU Standard Contractual Clauses apply)",
                    link: "https://resend.com/privacy",
                  },
                  {
                    name: "Google LLC (Gemini API)",
                    purpose: "AI-assisted feedback summaries, practice task grading, and job listing generation",
                    data: "Proof submission text and employer review context",
                    location: "US (EU Standard Contractual Clauses apply)",
                    link: "https://policies.google.com/privacy",
                  },
                  {
                    name: "GitHub Inc. (OAuth)",
                    purpose: "Optional social sign-in",
                    data: "Email address and public profile (only if you choose GitHub login)",
                    location: "US (EU Standard Contractual Clauses apply)",
                    link: "https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
                  },
                ].map((p) => (
                  <div key={p.name} className="border border-[var(--color-border)] rounded-lg p-4 space-y-1">
                    <p className="font-semibold text-[var(--color-text)]">{p.name}</p>
                    <p><strong>Purpose:</strong> {p.purpose}</p>
                    <p><strong>Data transferred:</strong> {p.data}</p>
                    <p><strong>Location:</strong> {p.location}</p>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-primary)] hover:underline text-xs">
                      View privacy policy →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">6. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active, subject to the following limits:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Active accounts:</strong> data is retained while your account exists.</li>
                <li><strong>Deleted accounts:</strong> all personal data is permanently erased within 30 days of account deletion, including files in storage.</li>
                <li><strong>Job applications:</strong> candidate proof submissions and employer feedback are retained for 24 months from the date of submission, after which they are deleted.</li>
                <li><strong>Consent records:</strong> records of when and to which version of our Terms you consented are retained for the duration of your account and for 5 years after deletion, as required for legal compliance.</li>
                <li><strong>Billing records:</strong> financial transaction records are retained for 5 years as required by Danish accounting law.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">7. Data Security</h2>
              <p>
                We apply industry-standard security measures including encrypted data transmission (TLS),
                encrypted storage, row-level security on all database tables, and role-based access controls.
                All data is hosted on Supabase infrastructure. In the event of a personal data breach that
                poses a risk to your rights and freedoms, we will notify the Danish Data Protection Authority
                (Datatilsynet) within 72 hours and affected users without undue delay.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">8. Cookies</h2>
              <p>
                We use essential cookies to maintain your login session. We do not use third-party advertising
                or tracking cookies. You may review and withdraw your cookie consent at any time using the
                preferences link in our cookie banner or in your browser settings.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">9. Your Legal Rights (GDPR)</h2>
              <p>Under GDPR you have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Access:</strong> request a copy of all personal data we hold about you (use the "Export Data" button in Settings).</li>
                <li><strong>Rectification:</strong> correct inaccurate data in your profile via Settings.</li>
                <li><strong>Erasure:</strong> delete your account and all associated data via Settings → Privacy & Data → Delete Account.</li>
                <li><strong>Restriction:</strong> request that we limit processing of your data in certain circumstances.</li>
                <li><strong>Portability:</strong> receive your data in a structured, machine-readable format (JSON export in Settings).</li>
                <li><strong>Objection:</strong> object to processing based on legitimate interests.</li>
                <li><strong>Withdraw consent:</strong> withdraw consent for marketing emails at any time in Settings → Notifications.</li>
                <li><strong>Human review:</strong> contest any automated decision or AI-generated assessment and request human review.</li>
              </ul>
              <p className="mt-2">
                You also have the right to lodge a complaint with the Danish Data Protection Authority (Datatilsynet)
                at <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-primary)] hover:underline">datatilsynet.dk</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">10. Contact Us</h2>
              <p>
                For any questions about this privacy policy, to exercise your rights, or to submit a Subject
                Access Request, contact us at{" "}
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="text-[var(--color-brand-primary)] underline hover:no-underline"
                >
                  hello@bevisly.com
                </button>
                . We will respond within 30 days.
              </p>
            </div>

          </section>
        </article>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
