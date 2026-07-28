import React from 'react';

export const FooterSection = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card text-xs text-muted-foreground py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-sm">
              G
            </div>
            <span className="font-heading font-bold text-base text-foreground">GharSetu</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <a href="/properties" className="hover:text-foreground transition-colors">Properties</a>
            <a href="/compare" className="hover:text-foreground transition-colors">Compare Matrix</a>
            <a href="/finance" className="hover:text-foreground transition-colors">Finance Suite</a>
            <a href="/login" className="hover:text-foreground transition-colors">Sign In</a>
            <a href="/register" className="hover:text-foreground transition-colors">Register</a>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 text-center text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 GharSetu Real Estate & Property Discovery Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
