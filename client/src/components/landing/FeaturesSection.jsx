import React from 'react';
import { ShieldCheck, GitCompare, Banknote, Sparkles } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section className="py-16 bg-accent/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Core Capabilities</span>
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight">
            Eliminating Decision Friction in Real Estate
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From financial qualification to admin-verified listings and side-by-side matrices — GharSetu delivers complete buyer trust and builder ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/40 transition-colors shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground">Verified Property Listings</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Admin-driven verification and duplicate-detection prevent fake listings, protecting buyer trust before publishing live.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-indigo-500/40 transition-colors shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground">Side-by-Side Comparison</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Evaluate price per sqft, carpet area ratio, RERA registration numbers, and amenities in a single standardized matrix.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-emerald-500/40 transition-colors shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground">Inline Finance Suite</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Calculate home loan EMIs, state-specific stamp duty, GST taxes, and maintenance charges without bouncing to bank calculators.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};;
