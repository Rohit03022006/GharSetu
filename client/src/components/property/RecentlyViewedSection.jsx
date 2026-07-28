import React from 'react';
import { useRecentlyViewed, useSearchHistory } from '../../hooks/useApi';
import { PropertyGridCard } from './PropertyGridCard';
import { Clock, Search, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const RecentlyViewedSection = () => {
  const { data: recentlyViewedRes } = useRecentlyViewed();
  const { data: searchHistoryRes } = useSearchHistory();

  const recentlyViewed = recentlyViewedRes?.data || recentlyViewedRes || [];
  const searchHistory = searchHistoryRes?.data || searchHistoryRes || [];

  if ((!recentlyViewed || recentlyViewed.length === 0) && (!searchHistory || searchHistory.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6 my-8">
      {recentlyViewed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-heading font-bold">Recently Viewed Properties</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyViewed.map((item, idx) => (
              <PropertyGridCard key={item.id || idx} item={item.property || item} />
            ))}
          </div>
        </div>
      )}

      {searchHistory.length > 0 && (
        <Card className="p-4 border-border">
          <CardHeader className="p-0 pb-3 flex flex-row items-center space-x-2">
            <History className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Your Recent Searches</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-2">
            {searchHistory.map((query, idx) => (
              <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-primary/20 flex items-center space-x-1">
                <Search className="w-3 h-3 text-muted-foreground mr-1" />
                <span>{typeof query === 'string' ? query : query.searchTerm || query.query || 'Noida Properties'}</span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
