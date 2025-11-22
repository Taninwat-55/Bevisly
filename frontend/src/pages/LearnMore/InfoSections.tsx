import { Repeat, ShieldCheck, HelpCircle } from "lucide-react";

interface InfoSectionsProps {
  accent: string;
}

export default function InfoSections({ accent }: InfoSectionsProps) {
  return (
    <>
      {/* 🔁 Proof Loop */}
      <section className="text-center border-t border-[var(--color-border)] pt-12 mt-12">
        <Repeat size={32} className="mx-auto mb-4 opacity-80" />
        <h3 className="heading-sm mb-2">The Proof Loop</h3>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-sm">
          Each submission becomes a verified record. Proof tasks, reviews, and
          feedback create a transparent skill network — connecting learning with
          opportunity.
        </p>
      </section>

      {/* ⚖️ Fairness */}
      <section className="text-center border-t border-[var(--color-border)] pt-12 mt-12">
        <ShieldCheck
          size={32}
          className="mx-auto mb-4 opacity-80"
          style={{ color: accent }}
        />
        <h3 className="heading-sm mb-2">Fairness & Transparency</h3>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-sm">
          Bevisly removes résumé bias by focusing on verified outcomes, not
          backgrounds. Equal tasks, equal metrics, equal opportunity — that’s
          our foundation.
        </p>
      </section>

      {/* ❓ FAQ */}
      <section className="text-center border-t border-[var(--color-border)] pt-12 mt-12">
        <HelpCircle size={28} className="mx-auto mb-4 opacity-80" />
        <h3 className="heading-sm mb-2">Common Questions</h3>
        <ul className="max-w-2xl mx-auto text-left text-sm text-[var(--color-text-muted)] divide-y divide-[var(--color-border)]">
          <li className="py-2">
            <strong>• What’s a proof task?</strong>
            <p>
              It’s a short, authentic project designed to showcase skills in
              context — not a test, but a small piece of real work.
            </p>
          </li>
          <li className="py-2">
            <strong>• Is Bevisly free?</strong>
            <p>
              Yes. You can join, complete proof tasks, and earn verified records
              at no cost.
            </p>
          </li>
          <li className="py-2">
            <strong>• Can I share my proofs?</strong>
            <p>
              Yes — your verified proofs appear in your public profile, ready to
              share with employers or learning platforms worldwide.
            </p>
          </li>
        </ul>
      </section>
    </>
  );
}
