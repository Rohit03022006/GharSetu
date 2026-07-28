import { prisma } from '../lib/prisma.js';

/**
 * Get Builder Dashboard Metrics (FR-ANLY-02, UC-AS-01)
 * Returns aggregated views, leads, bookings, conversion rate, and daily trend breakdown for a builder/owner.
 */
export const getBuilderMetrics = async (ownerId) => {
  const metrics = await prisma.propertyDailyMetric.findMany({
    where: { ownerId },
    orderBy: { date: 'asc' }
  });

  let totalViews = 0;
  let totalLeads = 0;
  let totalBookings = 0;
  let totalCompletions = 0;

  metrics.forEach((m) => {
    totalViews += m.viewsCount;
    totalLeads += m.leadsCount;
    totalBookings += m.bookingsCount;
    totalCompletions += m.completionsCount;
  });

  const conversionRate = totalViews > 0 ? parseFloat(((totalLeads / totalViews) * 100).toFixed(2)) : 0;

  return {
    summary: {
      totalViews,
      totalLeads,
      totalBookings,
      totalCompletions,
      conversionRate
    },
    dailyBreakdown: metrics
  };
};

/**
 * Get Platform-wide Admin Metrics (FR-ANLY-03, UC-AS-03)
 */
export const getAdminPlatformMetrics = async () => {
  const aggregate = await prisma.propertyDailyMetric.aggregate({
    _sum: {
      viewsCount: true,
      leadsCount: true,
      bookingsCount: true,
      completionsCount: true
    }
  });

  const totalViews = aggregate._sum.viewsCount || 0;
  const totalLeads = aggregate._sum.leadsCount || 0;
  const totalBookings = aggregate._sum.bookingsCount || 0;
  const totalCompletions = aggregate._sum.completionsCount || 0;
  const platformConversionRate = totalViews > 0 ? parseFloat(((totalLeads / totalViews) * 100).toFixed(2)) : 0;

  return {
    platformSummary: {
      totalViews,
      totalLeads,
      totalBookings,
      totalCompletions,
      platformConversionRate
    }
  };
};
