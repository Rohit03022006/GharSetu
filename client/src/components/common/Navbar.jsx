import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../theme-provider';
import {
  Search,
  Heart,
  LogOut,
  LayoutDashboard,
  Calculator,
  Layers,
  PlusCircle,
  UserCheck,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinkClasses = (path) =>
    `inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap px-3 py-2 rounded-lg transition-all duration-150 ${
      isActive(path)
        ? 'text-primary bg-primary/10 font-semibold'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-xl p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-lg shadow-sm">
              G
            </div>
            <span className="font-heading font-bold text-xl text-foreground tracking-tight whitespace-nowrap">
              GharSetu
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link to="/properties" className={navLinkClasses('/properties')}>
              <Search className="w-4 h-4 text-primary shrink-0" />
              <span>Search</span>
            </Link>

            <Link to="/compare" className={navLinkClasses('/compare')}>
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Compare</span>
            </Link>

            <Link to="/finance" className={navLinkClasses('/finance')}>
              <Calculator className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Finance Suite</span>
            </Link>

            {(user?.role === 'BUILDER' || user?.role === 'BROKER' || user?.role === 'ADMIN' || user?.role === 'SELLER') && (
              <Link to="/editor" className={navLinkClasses('/editor')}>
                <PlusCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Post Listing</span>
              </Link>
            )}

            {(user?.role === 'BROKER' || user?.role === 'BUILDER' || user?.role === 'ADMIN') && (
              <Link to="/leads" className={navLinkClasses('/leads')}>
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Lead Kanban</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/admin/moderation" className={navLinkClasses('/admin/moderation')}>
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Moderation</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/wishlist" className={navLinkClasses('/wishlist')}>
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Wishlist</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Actions: Theme Toggle & Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden xl:inline-flex text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                  {user?.role || 'BUYER'}
                </span>
                <Button asChild variant="outline" className="h-10 px-4 text-sm font-semibold rounded-xl shrink-0">
                  <Link
                    to={
                      user?.role === 'ADMIN'
                        ? '/admin'
                        : user?.role === 'BUILDER' || user?.role === 'SELLER'
                        ? '/builder'
                        : '/dashboard'
                    }
                    className="inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl shrink-0 cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="ghost" className="h-10 px-4 text-sm font-semibold rounded-xl text-foreground hover:text-primary shrink-0">
                  <Link to="/login" className="inline-flex items-center gap-2 whitespace-nowrap">
                    <LogIn className="w-4 h-4 text-primary shrink-0" />
                    <span>Sign In</span>
                  </Link>
                </Button>
                <Button asChild className="h-10 px-5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 shrink-0">
                  <Link to="/register" className="inline-flex items-center gap-2 whitespace-nowrap">
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>Get Started</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Actions & Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses('/properties')}
            >
              <Search className="w-4 h-4 text-primary shrink-0" />
              <span>Search Properties</span>
            </Link>

            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses('/compare')}
            >
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Compare Matrix</span>
            </Link>

            <Link
              to="/finance"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses('/finance')}
            >
              <Calculator className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Finance Suite</span>
            </Link>

            {(user?.role === 'BUILDER' || user?.role === 'BROKER' || user?.role === 'ADMIN' || user?.role === 'SELLER') && (
              <Link
                to="/editor"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses('/editor')}
              >
                <PlusCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Post Listing</span>
              </Link>
            )}

            {(user?.role === 'BROKER' || user?.role === 'BUILDER' || user?.role === 'ADMIN') && (
              <Link
                to="/leads"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses('/leads')}
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Lead Kanban</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/moderation"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses('/admin/moderation')}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Moderation</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses('/wishlist')}
              >
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Wishlist</span>
              </Link>
            )}
          </nav>

          {/* Mobile Auth CTAs */}
          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-2">
                <Button asChild variant="outline" className="h-10 w-full rounded-xl justify-center">
                  <Link
                    to={
                      user?.role === 'ADMIN'
                        ? '/admin'
                        : user?.role === 'BUILDER' || user?.role === 'SELLER'
                        ? '/builder'
                        : '/dashboard'
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="h-10 px-3 text-destructive rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button asChild variant="outline" className="h-10 rounded-xl justify-center">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-primary shrink-0" />
                    <span>Sign In</span>
                  </Link>
                </Button>
                <Button asChild className="h-10 rounded-xl bg-primary text-primary-foreground justify-center shadow-xs">
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>Get Started</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
