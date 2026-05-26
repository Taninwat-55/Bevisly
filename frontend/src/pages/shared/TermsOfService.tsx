import BackButton from "@/components/common/BackButton";
import { Helmet } from "react-helmet-async";

const LAST_UPDATED = "May 2026";

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service — Bevisly</title>
        <meta name="description" content="Bevisly's terms of service. Rules and guidelines for using the platform." />
        <link rel="canonical" href="https://bevisly.com/terms" />
      </Helmet>
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">
      {/* ── Header ── */}
      <div className="relative py-12 px-8 bg-[var(--color-brand-primary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4 mb-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <BackButton to="/" className="mb-6" variant="glass" label="Back to Home" />
          <h1 className="text-4xl font-bold font-display leading-tight mb-2">Terms of Service</h1>
          <p className="text-blue-100 max-w-xl text-lg opacity-90">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="px-8 max-w-3xl mx-auto">
        <article className="prose dark:prose-invert max-w-none bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-2xl shadow-sm">
          <section className="space-y-6 text-sm leading-relaxed text-[var(--color-text-muted)]">

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">1. About Bevisly</h2>
              <p>
                Bevisly ("we," "us," "the platform") is a recruitment platform that connects job seekers
                (candidates) with employers through structured, evidence-based hiring. Candidates complete
                proof tasks set by employers to demonstrate their skills. By creating an account you agree
                to these Terms of Service ("Terms") and our{" "}
                <a href="/privacy" className="text-[var(--color-brand-primary)] hover:underline">Privacy Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">2. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be at least 18 years old to use Bevisly.</li>
                <li>You must use the platform only for lawful employment and hiring purposes.</li>
                <li>You may not create accounts on behalf of others without their explicit consent.</li>
                <li>Employer accounts are restricted to organisations with a legitimate hiring need. Access
                    requires an invitation code issued by Bevisly.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">3. Your Responsibilities</h2>
              <p>By using Bevisly you agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide accurate, current, and complete information in your profile and submissions.</li>
                <li>Not impersonate any person or organisation.</li>
                <li>Not submit content that is unlawful, harmful, defamatory, or discriminatory.</li>
                <li>Not attempt to circumvent access controls, reverse-engineer, or scrape the platform.</li>
                <li>Not use the platform to spam, solicit, or harass other users.</li>
                <li>Employers: evaluate candidates fairly and without unlawful discrimination on protected
                    characteristics (as defined under Danish and EU law).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">4. Content and Intellectual Property</h2>
              <p>
                You retain ownership of all content you submit to Bevisly (proof submissions, portfolio
                files, written responses). By submitting content you grant Bevisly a limited, non-exclusive
                licence to store, display, and transmit that content solely to facilitate the hiring process.
                We do not sell your content to third parties.
              </p>
              <p className="mt-2">
                Bevisly's platform, design, and technology remain the exclusive property of Bevisly.
                You may not copy, modify, or distribute any part of the platform without written permission.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">5. Platform Rights</h2>
              <p>We reserve the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Suspend or terminate accounts that violate these Terms.</li>
                <li>Remove content that is harmful, unlawful, or inconsistent with the platform's purpose.</li>
                <li>Modify or discontinue any feature of the platform with reasonable notice where practical.</li>
                <li>Update these Terms. Material changes will be communicated by email or in-app notice.
                    Continued use after notice constitutes acceptance.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">6. AI-Assisted Features</h2>
              <p>
                Bevisly uses AI tools (powered by Google Gemini) to assist employers with generating
                feedback summaries. AI output is decision support only — it does not constitute an
                employment decision. Employers remain solely responsible for all hiring decisions made
                using the platform.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, Bevisly shall not be liable for any
                indirect, incidental, or consequential damages arising from your use of the platform,
                including loss of employment opportunities, loss of data, or business interruption.
                Bevisly's total liability shall not exceed the amount you have paid to us in the twelve
                months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">8. Data Protection</h2>
              <p>
                We process your personal data in accordance with the EU General Data Protection Regulation
                (GDPR) and the Danish Data Protection Act. Full details are set out in our{" "}
                <a href="/privacy" className="text-[var(--color-brand-primary)] hover:underline">Privacy Policy</a>.
                You have the right to access, correct, and delete your data at any time from your account
                settings.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">9. Governing Law</h2>
              <p>
                These Terms are governed by the laws of Denmark. Any disputes shall be subject to the
                exclusive jurisdiction of the courts of Denmark, without prejudice to any mandatory
                consumer protection rights you may hold under the law of your country of residence.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">10. Contact</h2>
              <p>
                Questions about these Terms? Contact us at{" "}
                <a href="mailto:bevislyapp@gmail.com" className="text-[var(--color-brand-primary)] hover:underline">
                  bevislyapp@gmail.com
                </a>
                .
              </p>
            </div>

          </section>
        </article>
      </div>
    </div>
    </>
  );
}
