import React from 'react';
import { useBuilderDashboard, useAdminDashboard } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Eye, CalendarCheck, Users, CheckCircle2, TrendingUp } from 'lucide-react';

export const Dashboards = () => {
  const { user } = useAuth();
  const isBuilder = user?.role === 'BUILDER' || user?.role === 'SELLER' || user?.role === 'BROKER';
  const isAdmin = user?.role === 'ADMIN';

  const builderQuery = useBuilderDashboard();
  const adminQuery = useAdminDashboard();

  const query = isBuilder ? builderQuery : adminQuery;
  const { data, isLoading, error } = query;

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)]">
              {isAdmin ? 'Platform Admin Analytics' : 'Builder Sales Analytics'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Real-time performance metrics powered by Redis Pub/Sub stream aggregation.
            </p>
          </div>
          <span className="self-start text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--action-primary)] text-white">
            Role: {user?.role || 'BUYER'}
          </span>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[var(--surface)] h-32 rounded-xl border border-[var(--border)] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-[var(--danger)] text-[var(--danger)] rounded-xl text-center">
            {error.message || 'Failed to load analytics dashboard'}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-xs font-semibold uppercase">Total Views</span>
                  <Eye className="w-5 h-5 text-[var(--action-primary)]" />
                </div>
                <div className="text-2xl font-bold font-heading tabular-nums">
                  {isBuilder ? data.data?.summary?.totalViews : data.data?.platformSummary?.totalViews}
                </div>
              </div>

              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-xs font-semibold uppercase">Total Leads</span>
                  <Users className="w-5 h-5 text-[var(--accent-cta)]" />
                </div>
                <div className="text-2xl font-bold font-heading tabular-nums">
                  {isBuilder ? data.data?.summary?.totalLeads : data.data?.platformSummary?.totalLeads}
                </div>
              </div>

              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-xs font-semibold uppercase">Site Visit Bookings</span>
                  <CalendarCheck className="w-5 h-5 text-[var(--action-primary)]" />
                </div>
                <div className="text-2xl font-bold font-heading tabular-nums">
                  {isBuilder ? data.data?.summary?.totalBookings : data.data?.platformSummary?.totalBookings}
                </div>
              </div>

              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-xs font-semibold uppercase">Conversion Rate</span>
                  <TrendingUp className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div className="text-2xl font-bold font-heading tabular-nums text-[var(--success)]">
                  {isBuilder ? data.data?.summary?.conversionRate : data.data?.platformSummary?.platformConversionRate}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
