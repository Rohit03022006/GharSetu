import React from 'react';
import { Building2, Users, ArrowRight, Compass, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RoleSuiteSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight">
          Tailored Workspaces for Every Stakeholder
        </h2>
        <p className="text-sm text-muted-foreground">
          Dedicated modules for home buyers, licensed brokers, real estate builders, and system admins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Buyer */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-foreground">Home Buyers</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore verified listings, save favorites to wishlist, run EMI calculations, and schedule site visits.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl mt-4 transition-colors duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary">
            <Link to="/properties" className="inline-flex items-center justify-center gap-1.5 font-semibold">
              <span>Browse Homes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Builder */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-foreground">Builders & Developers</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Publish project drafts, manage unit availability, monitor lead conversion rates, and upload floor plans.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl mt-4 transition-colors duration-200 hover:bg-indigo-500 hover:text-white hover:border-indigo-500">
            <Link to="/register" className="inline-flex items-center justify-center gap-1.5 font-semibold">
              <span>Join as Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Broker */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-foreground">Brokers & Agents</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Access the Lead Kanban pipeline, track client communications, and manage property portfolios efficiently.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl mt-4 transition-colors duration-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500">
            <Link to="/register" className="inline-flex items-center justify-center gap-1.5 font-semibold">
              <span>Join as Broker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Admin */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-foreground">Platform Moderation</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enforce quality controls, inspect property submissions, flag duplicate images, and verify identity claims.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl mt-4 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:border-amber-500">
            <Link to="/login" className="inline-flex items-center justify-center gap-1.5 font-semibold">
              <span>Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
