import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { RoleSuiteSection } from '../components/landing/RoleSuiteSection';
import { CtaBannerSection } from '../components/landing/CtaBannerSection';
import { FooterSection } from '../components/landing/FooterSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <HeroSection />
      <FeaturesSection />
      <RoleSuiteSection />
      <CtaBannerSection />
      <FooterSection />
    </div>
  );
};
