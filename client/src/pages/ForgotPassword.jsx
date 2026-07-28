import React from 'react';
import { ForgotPasswordCard } from '../components/auth/ForgotPasswordCard';
import { Sparkles, ShieldCheck, MailCheck, Lock, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  return (
    <div className="min-h-[85vh] bg-background flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Half - Account Recovery & Security */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Security & Recovery</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              Reset Your Credentials Securely
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Don't worry — enter your registered email address and we will dispatch password recovery instructions immediately.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <MailCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Instant Verification Link</h4>
                <p className="text-xs text-muted-foreground">Receive a secure, time-sensitive reset token directly in your inbox.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Encrypted Password Update</h4>
                <p className="text-xs text-muted-foreground">All credentials are hashed using industry-standard bcrypt protocols.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">Protected Account Integrity</h4>
                <p className="text-xs text-muted-foreground">Your wishlists, lead history, and property data remain 100% safe.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>24/7 Account Support</span>
            </div>
          </div>
        </div>

        {/* Right Half - ForgotPasswordCard */}
        <div className="w-full flex items-center justify-center">
          <ForgotPasswordCard />
        </div>
      </div>
    </div>
  );
};

