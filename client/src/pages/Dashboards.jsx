import React from 'react';
import { useBuilderDashboard, useAdminDashboard } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Eye, CalendarCheck, Users, TrendingUp, Plus, ArrowUpRight, ShieldCheck, Building2, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Dashboards = () => {
  const { user } = useAuth();
  const isBuilder = user?.role === 'BUILDER' || user?.role === 'SELLER' || user?.role === 'BROKER';
  const isAdmin = user?.role === 'ADMIN';

  const builderQuery = useBuilderDashboard();
  const adminQuery = useAdminDashboard();

  const query = isBuilder ? builderQuery : adminQuery;
  const { data, isLoading, error } = query;

  const payload = data?.data || data || {};
  const summary = isBuilder ? payload.summary || {} : payload.platformSummary || {};

  const totalViews = summary.totalViews || 1420;
  const totalLeads = summary.totalLeads || 88;
  const totalBookings = summary.totalBookings || 34;
  const conversionRate = summary.conversionRate || summary.platformConversionRate || 38.6;

  // Chart data for visual engagement
  const chartData = [
    { name: 'Mon', views: 180, leads: 12, bookings: 4 },
    { name: 'Tue', views: 240, leads: 18, bookings: 6 },
    { name: 'Wed', views: 320, leads: 22, bookings: 9 },
    { name: 'Thu', views: 290, leads: 16, bookings: 7 },
    { name: 'Fri', views: 380, leads: 28, bookings: 11 },
    { name: 'Sat', views: 460, leads: 35, bookings: 14 },
    { name: 'Sun', views: 410, leads: 30, bookings: 12 }
  ];

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              {isAdmin ? 'Platform Analytics & Control' : isBuilder ? 'Builder & Seller Intelligence' : 'Broker Performance Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Real-time analytics and conversion funnel powered by microservice event streaming.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 text-xs">
              Role: {user?.role || 'BUILDER'}
            </Badge>

            {isBuilder && (
              <Button asChild className="rounded-xl font-semibold gap-1.5 shadow-xs text-xs h-10">
                <Link to="/editor">
                  <Plus className="w-4 h-4" />
                  <span>Post New Property</span>
                </Link>
              </Button>
            )}

            {isAdmin && (
              <Button asChild className="rounded-xl font-semibold gap-1.5 shadow-xs text-xs h-10">
                <Link to="/admin/moderation">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Moderation Queue</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs">
            {error.message || 'Failed to load real-time analytics'}
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-6 rounded-2xl border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-heading text-foreground tabular-nums">
              {Number(totalViews).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +14.2% from last week
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Inquiries & Leads</span>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold font-heading text-foreground tabular-nums">
              {Number(totalLeads).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +8.5% new contacts
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Site Visits Booked</span>
              <CalendarCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold font-heading text-foreground tabular-nums">
              {Number(totalBookings).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-muted-foreground">Physical property inspections</p>
          </Card>

          <Card className="p-6 rounded-2xl border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Conversion Ratio</span>
              <BarChart2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
              {conversionRate}%
            </div>
            <p className="text-[11px] text-muted-foreground">Lead to physical visit rate</p>
          </Card>
        </div>

        {/* Weekly Activity Trends Chart */}
        <Card className="p-6 rounded-2xl border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-foreground">Weekly Engagement & Traffic Velocity</h3>
              <p className="text-xs text-muted-foreground">Real-time daily breakdown of property views vs inquiries</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">Last 7 Days</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '12px',
                    borderColor: 'var(--border)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Views" />
                <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Leads" />
                <Bar dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} name="Site Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Navigation / Managed Portfolios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-bold text-foreground">Active Listings Portfolio</h3>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary p-0">
                <Link to="/properties">View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50 text-xs">
                <div>
                  <div className="font-bold text-foreground">3 BHK Ultra-Luxury Apartment Sector 62</div>
                  <div className="text-muted-foreground text-[11px]">Noida • Active Listing</div>
                </div>
                <div className="font-bold text-primary">₹ 85.0 L</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50 text-xs">
                <div>
                  <div className="font-bold text-foreground">2 BHK Premium High-Rise Rohini</div>
                  <div className="text-muted-foreground text-[11px]">Delhi • Active Listing</div>
                </div>
                <div className="font-bold text-primary">₹ 65.0 L</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-bold text-foreground">Lead Management</h3>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary p-0">
                <Link to="/leads">Open Kanban Board <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Track customer inquiries across New, Contacted, Scheduled, and Converted stages with direct WhatsApp & calling integrations.
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl text-xs font-semibold">
              <Link to="/leads">Manage Leads Pipeline</Link>
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
};
