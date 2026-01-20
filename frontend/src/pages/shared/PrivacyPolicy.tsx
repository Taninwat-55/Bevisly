import BackButton from "@/components/ui/BackButton";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 py-12 transition-colors">
      <div className="max-w-3xl mx-auto">
        <BackButton to="/" />

        <article className="mt-8 prose dark:prose-invert max-w-none">
          <h1 className="heading-lg mb-2">Privacy Policy</h1>
          <p className="text-[var(--color-text-muted)] mb-8 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>

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
                <a href="mailto:support@bevisly.com" className="text-[var(--color-candidate)] underline hover:no-underline">
                  support@bevisly.com
                </a>{" "}
                or use the Feedback button on the site.
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}