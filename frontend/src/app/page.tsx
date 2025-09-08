"use client"

import { HeroSection } from "@/components/home/hero-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { HowItWorks } from "@/components/home/how-it-works";
import { CTASection } from "@/components/home/cta-section";

export default function Home() {

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProperties />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
