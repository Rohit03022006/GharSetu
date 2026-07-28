import React from 'react';
import { useWishlist, useBookings, useRemoveFromWishlist } from '../hooks/useApi';
import { Heart, Calendar, Clock, MapPin, IndianRupee, Trash2, StickyNote } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentlyViewedSection } from '@/components/property/RecentlyViewedSection';

const WishlistItemCard = ({ item }) => {
  const removeWishlist = useRemoveFromWishlist();
  const prop = item.property || {};

  return (
    <Card className="p-4 border-border shadow-sm flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              {prop.title || `Property ID: ${item.propertyId}`}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
              {prop.city || 'Location Details N/A'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => removeWishlist.mutate(item.propertyId)}
            disabled={removeWishlist.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {prop.price && (
          <p className="font-heading font-extrabold text-primary text-base flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {Number(prop.price).toLocaleString('en-IN')}
          </p>
        )}

        {item.notes && (
          <div className="bg-muted/50 p-2 rounded-md border border-input text-xs text-muted-foreground flex items-start space-x-1.5">
            <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{item.notes}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Added {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'Recently'}
        </span>
        <Button asChild size="sm" variant="outline">
          <Link to={`/properties/${item.propertyId}`}>View Details</Link>
        </Button>
      </div>
    </Card>
  );
};

export const BuyerDashboard = () => {
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlist();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();

  const rawWishlist = wishlistData?.data || wishlistData || [];
  const wishlistItems = Array.isArray(rawWishlist) ? rawWishlist : [];

  const rawBookings = bookingsData?.data || bookingsData || [];
  const bookingItems = Array.isArray(rawBookings) ? rawBookings : [];

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Buyer Activity Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your site visit bookings, saved wishlists, and scheduled tours.</p>
        </div>

        {/* Tabbed view using shadcn Tabs */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Content */}
          <TabsContent value="bookings" className="mt-6 space-y-4">
            {bookingsLoading && <Skeleton className="h-32 w-full rounded-xl" />}
            {!bookingsLoading && bookingItems.length === 0 && (
              <Card className="p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground font-medium">No site visit bookings yet</p>
                <Button asChild size="sm">
                  <Link to="/">Browse Properties</Link>
                </Button>
              </Card>
            )}
            {bookingItems.map((b) => (
              <Card key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50 uppercase">
                    {b.status}
                  </Badge>
                  <h3 className="font-heading font-semibold text-base">Site Visit for Property ID: {b.propertyId}</h3>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                    Scheduled on: {b.scheduledDate} ({b.slotTime || '10:00 AM'})
                  </p>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Wishlist Content */}
          <TabsContent value="wishlist" className="mt-6 space-y-4">
            {wishlistLoading && <Skeleton className="h-32 w-full rounded-xl" />}
            {!wishlistLoading && wishlistItems.length === 0 && (
              <Card className="p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground font-medium">Nothing saved yet</p>
                <p className="text-xs text-muted-foreground">Properties you save will show up here.</p>
                <Link to="/">
                  <Button size="sm">Explore Properties</Button>
                </Link>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlistItems.map((item) => (
                <WishlistItemCard key={item.id || item.propertyId} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Discovery History & Recently Viewed */}
        <RecentlyViewedSection />
      </div>
    </div>
  );
};
