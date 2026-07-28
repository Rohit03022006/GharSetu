import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CtaBannerSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="relative rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Subtle Decorative Grid Line Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-2xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Ready to Explore?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-tight">
            Start Your Property Search with Absolute Confidence
          </h2>
          <p className="text-primary-foreground/80 text-sm sm:text-base leading-relaxed">
            Create a free account to unlock side-by-side comparison, save wishlist properties, and access complete pricing breakdowns.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto">
          <Button asChild size="lg" className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90 font-bold rounded-xl h-11 px-6 shadow-md cursor-pointer whitespace-nowrap">
            <Link to="/register" className="inline-flex items-center justify-center gap-2">
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white font-semibold rounded-xl h-11 px-6 cursor-pointer whitespace-nowrap">
            <Link to="/properties" className="inline-flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Browse All Properties</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
