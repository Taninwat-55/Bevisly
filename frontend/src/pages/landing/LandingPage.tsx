import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import JobListingsSection from "@/components/landing/JobListingsSection";
import WhyProofSection from "@/components/landing/WhyProofSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import FeaturedEmployersSection from "@/components/landing/FeaturedEmployerSection";
import FeedbackButton from "@/components/ui/FeedbackButton";

export default function LandingPage() {
  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <HeroSection />
      <JobListingsSection />
      <FeaturedEmployersSection />
      <ProblemSection />
      <HowItWorksSection />
      <WhyProofSection />
      <FinalCTASection />
      <FeedbackButton />
    </div>
  );
}
