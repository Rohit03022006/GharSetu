import React from 'react';
import { LoginFormCard } from '../components/auth/LoginFormCard';
import { Building2, ShieldCheck, GitCompare, Banknote, Sparkles, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  return (
    <div className="min-h-[85vh] bg-background flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Half - Application Highlights */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GharSetu Enterprise Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              India's Trusted Real Estate Ecosystem
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Eliminate decision friction with admin-verified listings, side-by-side RERA matrix comparisons, and inline financial intelligence.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Verified & Duplicate-Free Listings</h4>
                <p className="text-xs text-muted-foreground">RERA numbers & duplicate image detection guarantee listing authenticity.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Side-by-Side Matrix Evaluation</h4>
                <p className="text-xs text-muted-foreground">Compare price per sqft, carpet ratios, and amenities in one standardized matrix.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Inline Financial Calculations</h4>
                <p className="text-xs text-muted-foreground">Instant EMI breakdown, state stamp duties, and GST estimates built-in.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% RERA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>

        {/* Right Half - LoginFormCard */}
        <div className="w-full flex items-center justify-center">
          <LoginFormCard />
        </div>
      </div>
    </div>
  );
};

