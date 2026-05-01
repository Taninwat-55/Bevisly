import { Repeat, ShieldCheck, HelpCircle } from "lucide-react";

interface InfoSectionsProps {
  accent: string;
}

export default function InfoSections({ accent }: InfoSectionsProps) {
  return (
    <>
      {/* Proof Loop */}
      <section className="text-center border-t border-[var(--color-border)] pt-12 mt-12">
        <Repeat size={32} className="mx-auto mb-4 opacity-80" />
        <h3 className="heading-sm mb-2">Prove once. Share everywhere.</h3>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-sm">
          Every submission creates a verified record on your public profile. Complete a task for one employer — the proof belongs to you, forever. Share it in future applications, on LinkedIn, anywhere.
        </p>
      </section>

      {/* Fairness */}
      <section className="text-center border-t border-[var(--color-border)] pt-12 mt-12">
        <ShieldCheck
          size={32}
          className="mx-auto mb-4 opacity-80"
          style={{ color: accent }}
        />
        <h3 className="heading-sm mb-2">Employer-reviewed. AI-assisted. Never a black box.</h3>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-sm">
          Every score includes a rubric you can see, AI-generated notes on your submission, and direct employer feedback. You know exactly how you were evaluated and why.
        </p>
      </section>

      {/* FAQ */}
      <section className="text-center border-t border-[var(--color-border)] pt-12 mt-12">
        <HelpCircle size={28} className="mx-auto mb-4 opacity-80" />
        <h3 className="heading-sm mb-2">Common Questions</h3>
        <ul className="max-w-2xl mx-auto text-left text-sm text-[var(--color-text-muted)] divide-y divide-[var(--color-border)]">
          <li className="py-2">
            <strong>• What’s a proof task?</strong>
            <p>
              A short, authentic work sample — typically 30 minutes — designed specifically for the role. Not a trick question or an algorithmic puzzle. Real work, in context.
            </p>
          </li>
          <li className="py-2">
            <strong>• Is Bevisly free for candidates?</strong>
            <p>
              Yes. Completing proof tasks, building your portfolio, and sharing your credentials is always free for candidates.
            </p>
          </li>
          <li className="py-2">
            <strong>• Can I share my proofs?</strong>
            <p>
              Yes — your verified proofs appear on your public profile at bevisly.com/@yourusername. Share the link in job applications, your LinkedIn bio, or anywhere you want to demonstrate real skill.
            </p>
          </li>
        </ul>
      </section>
    </>
  );
}
