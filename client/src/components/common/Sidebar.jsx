import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../theme-provider';
import {
  Building2,
  GitCompare,
  Banknote,
  LayoutDashboard,
  Heart,
  PlusSquare,
  KanbanSquare,
  ShieldCheck,
  User,
  BadgeCheck,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role || 'GUEST';

  if (!isAuthenticated) {
    return null;
  }

  const linkClass = ({ isActive }) =>
    `flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3.5 px-4'} py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
      ? 'bg-primary/15 text-primary font-bold shadow-xs backdrop-blur-md border border-primary/20'
      : 'text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 hover:backdrop-blur-sm'
    }`;

  return (
    <aside
      className={`sticky top-0 h-screen border-r border-white/20 dark:border-white/10 bg-background/60 backdrop-blur-xl shadow-xl flex flex-col justify-between p-3 shrink-0 transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="space-y-6">
        {/* Brand & Toggle Header */}
        <div className={`flex items-center ${collapsed ? 'flex-col space-y-3 items-center justify-center' : 'justify-between px-1'}`}>
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 text-white flex items-center justify-center font-heading font-bold text-lg shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              G
            </div>
            {!collapsed && (
              <span className="font-heading font-bold text-base text-foreground tracking-tight">GharSetu</span>
            )}
          </Link>

          <div className="flex items-center space-x-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {/* Core Discovery */}
        <div className="space-y-1">
          {!collapsed && <p className="px-4 text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Discovery</p>}
          <NavLink to="/properties" className={linkClass} title={collapsed ? 'Property Search' : ''}>
            <Building2 className="w-5 h-5 shrink-0 text-primary" />
            {!collapsed && <span>Property Search</span>}
          </NavLink>
          <NavLink to="/compare" className={linkClass} title={collapsed ? 'Comparison Matrix' : ''}>
            <GitCompare className="w-5 h-5 shrink-0 text-indigo-500" />
            {!collapsed && <span>Comparison Matrix</span>}
          </NavLink>
          <NavLink to="/finance" className={linkClass} title={collapsed ? 'Finance Suite' : ''}>
            <Banknote className="w-5 h-5 shrink-0 text-emerald-500" />
            {!collapsed && <span>Finance Suite</span>}
          </NavLink>
        </div>

        {/* Role Workspaces */}
        <div className="space-y-1">
          {!collapsed && <p className="px-4 text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Workspace</p>}

          <NavLink
            to={
              role === 'ADMIN'
                ? '/admin'
                : role === 'BUILDER' || role === 'SELLER'
                  ? '/builder'
                  : '/dashboard'
            }
            className={linkClass}
            title={collapsed ? 'Dashboard' : ''}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-blue-500" />
            {!collapsed && (
              <span>
                {role === 'ADMIN'
                  ? 'Admin Dashboard'
                  : role === 'BUILDER' || role === 'SELLER'
                    ? 'Builder Dashboard'
                    : 'Buyer Dashboard'}
              </span>
            )}
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/wishlist" className={linkClass} title={collapsed ? 'My Wishlist' : ''}>
              <Heart className="w-5 h-5 text-rose-500 shrink-0" />
              {!collapsed && <span>My Wishlist</span>}
            </NavLink>
          )}

          {(role === 'BUILDER' || role === 'BROKER' || role === 'ADMIN' || role === 'SELLER') && (
            <NavLink to="/editor" className={linkClass} title={collapsed ? 'Post New Listing' : ''}>
              <PlusSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              {!collapsed && <span>Post New Listing</span>}
            </NavLink>
          )}

          {(role === 'BROKER' || role === 'BUILDER' || role === 'ADMIN') && (
            <NavLink to="/leads" className={linkClass} title={collapsed ? 'Leads Kanban' : ''}>
              <KanbanSquare className="w-5 h-5 text-purple-500 shrink-0" />
              {!collapsed && <span>Leads Kanban</span>}
            </NavLink>
          )}

          {role === 'ADMIN' && (
            <NavLink to="/admin/moderation" className={linkClass} title={collapsed ? 'Moderation Queue' : ''}>
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
              {!collapsed && <span>Moderation Queue</span>}
            </NavLink>
          )}
        </div>

        {/* Account Management */}
        {isAuthenticated && (
          <div className="space-y-1">
            {!collapsed && <p className="px-4 text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Account</p>}
            <NavLink to="/profile" className={linkClass} title={collapsed ? 'Profile Settings' : ''}>
              <User className="w-5 h-5 shrink-0 text-foreground" />
              {!collapsed && <span>Profile Settings</span>}
            </NavLink>
            <NavLink to="/verifications" className={linkClass} title={collapsed ? 'KYC Verification' : ''}>
              <BadgeCheck className="w-5 h-5 shrink-0 text-teal-500" />
              {!collapsed && <span>KYC Verification</span>}
            </NavLink>
          </div>
        )}
        {/* User Identity Summary */}
        {isAuthenticated ? (
          <div className={`p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-sm flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white font-heading font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-heading font-bold text-foreground truncate">{user?.name || 'User'}</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                    {role}
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button onClick={logout} variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0 rounded-xl">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ) : (
          !collapsed && (
            <div className="p-3 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 space-y-2 shadow-sm">
              <p className="text-xs text-muted-foreground">Welcome to GharSetu</p>
              <div className="flex items-center space-x-2">
                <Link to="/login" className="w-full">
                  <Button size="sm" variant="outline" className="w-full text-xs h-7 rounded-xl border-white/20">
                    <LogIn className="w-3 h-3 mr-1" /> Login
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button size="sm" className="w-full text-xs h-7 rounded-xl bg-primary/90 hover:bg-primary">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          )
        )}
      </div>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="pt-4 border-t border-border/40 text-[11px] text-muted-foreground text-center">
          GharSetu v1.0
        </div>
      )}
    </aside>
  );
};
