import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/useApi';
import { ArrowLeft, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { PropertyGalleryHeader } from '../components/property/PropertyGalleryHeader';
import { PropertyFinanceTabs } from '../components/property/PropertyFinanceTabs';
import { PropertyReviewSection } from '../components/property/PropertyReviewSection';
import { SimilarPropertiesSection } from '../components/property/SimilarPropertiesSection';
import { RecentlyViewedSection } from '../components/property/RecentlyViewedSection';

export const PropertyDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = usePropertyDetails(id);
  const [isSaved, setIsSaved] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const prop = data?.data || data;

  if (error || !prop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground">Property Listing Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error?.message || 'The property listing you requested does not exist in the database or may have been deactivated.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
          <Button asChild size="sm" className="rounded-xl gap-2 font-semibold text-xs">
            <Link to="/properties">
              <Home className="w-4 h-4" />
              <span>Browse Properties</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/properties"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search Results
          </Link>
          <span className="text-[11px] font-mono text-muted-foreground">ID: {prop.id}</span>
        </div>

        {/* Section 1: Gallery, Price & Visit Booking */}
        <PropertyGalleryHeader prop={prop} isSaved={isSaved} setIsSaved={setIsSaved} />

        {/* Section 2: Specifications, Amenities & Dynamic Cost Breakdown */}
        <PropertyFinanceTabs prop={prop} />

        {/* Section 3: Verified Ratings & Reviews */}
        <PropertyReviewSection
          propertyId={prop.id}
          avgRating={prop.avgRating}
          totalReviews={prop.totalReviews}
          reviews={prop.reviews || []}
        />

        {/* Section 4: Similar Properties Recommendation */}
        <SimilarPropertiesSection propertyId={prop.id} />

        {/* Section 5: Buyer History & Recently Viewed */}
        <RecentlyViewedSection />

      </div>
    </div>
  );
};
