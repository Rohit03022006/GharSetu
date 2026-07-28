import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/useApi';
import { ArrowLeft } from 'lucide-react';

import { PropertyGalleryHeader } from '../components/property/PropertyGalleryHeader';
import { PropertyFinanceTabs } from '../components/property/PropertyFinanceTabs';
import { PropertyReviewSection } from '../components/property/PropertyReviewSection';

export const PropertyDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = usePropertyDetails(id);
  const [isSaved, setIsSaved] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-medium text-muted-foreground">
        Fetching property specifications...
      </div>
    );
  }

  const prop = data?.data || {
    id: id || '1',
    title: '3 BHK Ultra-Luxury Apartment Sector 62',
    price: 8500000,
    city: 'Noida',
    address: 'Plot 4, Sector 62',
    listingType: 'SALE',
    bedrooms: 3,
    areaSqFt: 1450,
    avgRating: 4.8,
    totalReviews: 12,
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80']
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search Results
        </Link>

        {/* Modular Component 1: Gallery & Visit Booking */}
        <PropertyGalleryHeader prop={prop} isSaved={isSaved} setIsSaved={setIsSaved} />

        {/* Modular Component 2: Specifications, Amenities & Finance Tabs */}
        <PropertyFinanceTabs prop={prop} />

        {/* Modular Component 3: Ratings & Verified Buyer Reviews */}
        <PropertyReviewSection
          propertyId={prop.id}
          avgRating={prop.avgRating}
          totalReviews={prop.totalReviews}
        />
      </div>
    </div>
  );
};
