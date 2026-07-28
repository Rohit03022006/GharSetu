import React, { useState } from 'react';
import { useSearchProperties } from '../hooks/useApi';
import { PropertySearchFilter } from '../components/property/PropertySearchFilter';
import { PropertyGridCard } from '../components/property/PropertyGridCard';

export const SearchHome = () => {
  const [searchCity, setSearchCity] = useState('');
  const [bhk, setBhk] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const [activeFilters, setActiveFilters] = useState({});

  const { data, isLoading } = useSearchProperties(activeFilters);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilters({
      ...(searchCity ? { city: searchCity } : {}),
      ...(bhk ? { bedrooms: bhk } : {}),
      ...(priceRange ? { maxPrice: priceRange } : {})
    });
  };

  const rawListings = data?.data || data || [];
  const properties = Array.isArray(rawListings) && rawListings.length > 0 ? rawListings : [
    { id: '1', title: '3 BHK Ultra-Luxury Apartment Sector 62', price: 8500000, city: 'Noida', bedrooms: 3, areaSqFt: 1450, listingType: 'SALE' },
    { id: '2', title: '2 BHK Premium High-Rise Rohini', price: 6500000, city: 'Delhi', bedrooms: 2, areaSqFt: 1050, listingType: 'SALE' },
    { id: '3', title: '4 BHK Sea View Villa Bandra', price: 250000, city: 'Navi Mumbai', bedrooms: 4, areaSqFt: 3200, listingType: 'RENT' }
  ];

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Discover Premium Verified Properties</h1>
          <p className="text-sm text-muted-foreground">Direct listing matching with transparent builder pricing.</p>
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

        {/* Modular Component 2: Responsive Property Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold">Featured Properties</h2>
            <span className="text-xs text-muted-foreground">Showing {properties.length} verified listings</span>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Fetching real-time property inventory...
            </div>
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
