import React from 'react';
import { RegisterFormCard } from '../components/auth/RegisterFormCard';
import { Sparkles, UserPlus, KeyRound, Building2, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  return (
    <div className="min-h-[85vh] bg-background flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Half - Registration Value Proposition */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join GharSetu Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              Create Your Tailored Workspace
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlock role-specific portals whether you are buying your dream home, managing client portfolios as an agent, or launching new developments.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Buyer Wishlists & Site Visit Scheduling</h4>
                <p className="text-xs text-muted-foreground">Save verified properties, track price changes, and book direct site tours.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Builder & Broker Lead Kanban</h4>
                <p className="text-xs text-muted-foreground">Publish inventory, track buyer leads, and manage communications seamlessly.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Instant Role-Based Access Control</h4>
                <p className="text-xs text-muted-foreground">Seamless transition to your personalized dashboard immediately after sign-up.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free Account Registration</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant Setup</span>
            </div>
          </div>
        </div>

        {/* Right Half - RegisterFormCard */}
        <div className="w-full flex items-center justify-center">
          <RegisterFormCard />
        </div>
      </div>
    </div>
  );
};

