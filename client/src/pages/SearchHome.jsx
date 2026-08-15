import React, { useState } from 'react';
import { useSearchProperties } from '../hooks/useApi';
import { PropertySearchFilter } from '../components/property/PropertySearchFilter';
import { PropertyGridCard } from '../components/property/PropertyGridCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchX, RefreshCw, Sparkles } from 'lucide-react';

export const SearchHome = () => {
  const [searchCity, setSearchCity] = useState('');
  const [bhk, setBhk] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const [activeFilters, setActiveFilters] = useState({});

  const { data, isLoading, error, refetch } = useSearchProperties(activeFilters);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilters({
      ...(searchCity ? { city: searchCity } : {}),
      ...(bhk ? { bedrooms: bhk } : {}),
      ...(priceRange ? { maxPrice: priceRange } : {})
    });
  };

  const handleResetFilters = () => {
    setSearchCity('');
    setBhk('');
    setPriceRange('');
    setActiveFilters({});
  };

  const rawListings = data?.data || data || [];
  const properties = Array.isArray(rawListings) ? rawListings : [];

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Discover Premium Verified Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">Direct listing matching with transparent builder pricing and zero brokerage options.</p>
        </div>

        {/* Modular Component 1: Search Filter Bar */}
        <PropertySearchFilter
          searchCity={searchCity}
          setSearchCity={setSearchCity}
          bhk={bhk}
          setBhk={setBhk}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onSearch={handleSearchSubmit}
        />

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs flex items-center justify-between">
            <span>{error.message || 'Failed to fetch search results from Listing Service.'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </div>
        )}

        {/* Modular Component 2: Responsive Property Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-foreground">Verified Real Estate Inventory</h2>
            <span className="text-xs text-muted-foreground">
              {isLoading ? 'Scanning database...' : `Showing ${properties.length} verified listings`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl border border-border overflow-hidden space-y-3 p-4 bg-card">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="pt-2 flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border rounded-2xl space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <SearchX className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-heading font-bold text-foreground">No Properties Found</h3>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(activeFilters).length > 0
                    ? 'No real estate listings match your active filters. Try adjusting city, BHK, or budget criteria.'
                    : 'There are currently no active properties in the database.'}
                </p>
              </div>
              {Object.keys(activeFilters).length > 0 && (
                <Button onClick={handleResetFilters} variant="outline" size="sm" className="rounded-xl text-xs">
                  Reset All Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((item) => (
                <PropertyGridCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
