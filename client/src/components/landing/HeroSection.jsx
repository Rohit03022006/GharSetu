import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (propertyType !== 'ALL') params.set('type', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-8 overflow-hidden">
      {/* Background Decorative Grid Lines */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none -z-10" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(120, 120, 120, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(120, 120, 120, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)'
        }}
      />

      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>Admin Moderated & Verified Real Estate Discovery</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-foreground leading-tight">
          Unify Property Search, Comparison & <span className="text-primary">Financial Intelligence</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          GharSetu brings Buyers, Brokers, and Builders onto a single platform — featuring side-by-side comparison, Verified Builder credentials, and an inline Finance Suite for stamp duty, EMI, and GST estimation.
        </p>
      </div>

      {/* Real Interactive Search Bar Widget */}
      <form
        onSubmit={handleSearchSubmit}
        className="max-w-4xl mx-auto p-3 rounded-2xl bg-card border border-border shadow-lg space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 text-left"
      >
        <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl bg-accent/40 border border-border/50">
          <MapPin className="w-5 h-5 text-primary mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Search by City (e.g. Noida, Gurugram, Delhi NCR)..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-medium text-foreground focus:outline-hidden placeholder:text-muted-foreground"
          />
        </div>

        <div className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl bg-accent/40 border border-border/50">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-medium text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Listing Types</option>
            <option value="APARTMENT">Apartment / Flat</option>
            <option value="VILLA">Independent Villa</option>
            <option value="PLOT">Residential Plot</option>
          </select>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto h-11 px-7 rounded-xl font-semibold bg-primary text-primary-foreground shadow-md cursor-pointer whitespace-nowrap"
        >
          <Search className="w-4 h-4 mr-2" />
          Search Properties
        </Button>
      </form>
    </section>
  );
};
