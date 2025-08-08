import Header       from "@/components/landing/Header";
import Hero         from "@/components/landing/Hero";
import Stats        from "@/components/landing/Stats";
import Features     from "@/components/landing/Features";
import HowItWorks   from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Cta          from "@/components/landing/Cta";
import Footer       from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
