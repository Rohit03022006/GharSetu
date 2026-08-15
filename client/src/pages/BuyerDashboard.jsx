import React, { useState } from 'react';
import { useWishlist, useBookings, useRemoveFromWishlist, useCancelBooking, useRescheduleBooking } from '../hooks/useApi';
import { Heart, Calendar, Clock, MapPin, IndianRupee, Trash2, StickyNote, CheckCircle, XCircle, AlertCircle, ArrowRight, Star, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RecentlyViewedSection } from '@/components/property/RecentlyViewedSection';

export const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlist();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();
  const removeWishlist = useRemoveFromWishlist();
  const cancelBookingMutation = useCancelBooking();
  const rescheduleMutation = useRescheduleBooking();

  const [cancelModalBookingId, setCancelModalBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [statusFeedback, setStatusFeedback] = useState('');

  const rawWishlist = wishlistData?.data || wishlistData || [];
  const wishlistItems = Array.isArray(rawWishlist) ? rawWishlist : [];

  const rawBookings = bookingsData?.data || bookingsData || [];
  const bookingItems = Array.isArray(rawBookings) ? rawBookings : [];

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBookingMutation.mutateAsync({
        bookingId,
        reason: cancelReason || 'Buyer requested cancellation'
      });
      setStatusFeedback('Booking successfully cancelled.');
      setCancelModalBookingId(null);
      setCancelReason('');
    } catch (err) {
      setStatusFeedback('Failed to cancel: ' + (err.message || 'Error'));
    }
  };

  const handleReschedule = async (bookingId) => {
    if (!newDate) return;
    try {
      await rescheduleMutation.mutateAsync({
        bookingId,
        newDate: new Date(newDate).toISOString()
      });
      setStatusFeedback('Booking rescheduled successfully.');
      setRescheduleBookingId(null);
      setNewDate('');
    } catch (err) {
      setStatusFeedback('Failed to reschedule: ' + (err.message || 'Error'));
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'CONFIRMED').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-600 text-white font-semibold">Completed</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-blue-600 text-white font-semibold">Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'RESCHEDULED':
        return <Badge className="bg-amber-600 text-white font-semibold">Rescheduled</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{s}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Buyer Activity & Portal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your site visit bookings, saved shortlist, and visit reviews in one place.
            </p>
          </div>
          {wishlistItems.length > 1 && (
            <Button
              onClick={() => {
                const ids = wishlistItems.map(w => w.propertyId || w.id || w.property?.id).filter(Boolean);
                navigate(`/compare?ids=${ids.slice(0, 4).join(',')}`);
              }}
              variant="outline"
              className="rounded-xl gap-2 font-semibold text-xs h-10 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Layers className="w-4 h-4" />
              <span>Compare Saved ({wishlistItems.length})</span>
            </Button>
          )}
        </div>

        {statusFeedback && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center justify-between">
            <span>{statusFeedback}</span>
            <button onClick={() => setStatusFeedback('')} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Tabbed workspace */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="bookings" className="flex items-center space-x-2 text-xs font-semibold rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>My Site Visits ({bookingItems.length})</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2 text-xs font-semibold rounded-lg">
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlistItems.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Content */}
          <TabsContent value="bookings" className="mt-6 space-y-4">
            {bookingsLoading && (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            )}

            {!bookingsLoading && bookingItems.length === 0 && (
              <Card className="p-10 text-center space-y-4 border-dashed border-border rounded-2xl">
                <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground">No Site Visits Scheduled</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Explore properties and book free physical site visits with verified brokers and developers.
                  </p>
                </div>
                <Button asChild size="sm" className="rounded-xl font-semibold">
                  <Link to="/properties">Browse Properties</Link>
                </Button>
              </Card>
            )}

            <div className="space-y-4">
              {bookingItems.map((b) => {
                const isCompleted = (b.status || '').toUpperCase() === 'COMPLETED';
                const isCancelled = (b.status || '').toUpperCase() === 'CANCELLED';

                return (
                  <Card key={b.id} className="p-5 rounded-2xl border-border shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(b.status)}
                          <span className="text-[11px] font-mono text-muted-foreground">ID: {b.id}</span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-foreground">
                          {b.property?.title || `Physical Site Visit for Property #${b.propertyId}`}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                          <span>
                            Scheduled for: {b.scheduledDate ? new Date(b.scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Flexible'}
                          </span>
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isCompleted && (
                          <Button
                            asChild
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                          >
                            <Link to={`/properties/${b.propertyId || b.property?.id}`}>
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Write Verified Review</span>
                            </Link>
                          </Button>
                        )}

                        {!isCompleted && !isCancelled && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRescheduleBookingId(b.id)}
                              className="rounded-xl text-xs font-semibold"
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCancelModalBookingId(b.id)}
                              className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10"
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
                          <Link to={`/properties/${b.propertyId || b.property?.id}`}>
                            <span>View Property</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Reschedule Inline Form */}
                    {rescheduleBookingId === b.id && (
                      <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row items-center gap-3">
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="text-xs bg-background"
                        />
                        <div className="flex space-x-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleReschedule(b.id)}
                            disabled={rescheduleMutation.isPending || !newDate}
                            className="text-xs rounded-xl font-semibold"
                          >
                            Confirm Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRescheduleBookingId(null)}
                            className="text-xs rounded-xl"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cancel Reason Inline Form */}
                    {cancelModalBookingId === b.id && (
                      <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 flex flex-col sm:flex-row items-center gap-3">
                        <Input
                          type="text"
                          placeholder="Reason for cancellation (optional)..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="text-xs bg-background"
                        />
                        <div className="flex space-x-2 shrink-0">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={cancelBookingMutation.isPending}
                            className="text-xs rounded-xl font-semibold"
                          >
                            Confirm Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCancelModalBookingId(null)}
                            className="text-xs rounded-xl"
                          >
                            Back
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Wishlist Content */}
          <TabsContent value="wishlist" className="mt-6 space-y-4">
            {wishlistLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-44 rounded-2xl" />
              </div>
            )}

            {!wishlistLoading && wishlistItems.length === 0 && (
              <Card className="p-10 text-center space-y-4 border-dashed border-border rounded-2xl">
                <Heart className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground">Your Wishlist is Empty</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save properties you love to quickly compare specs, prices, and schedule tours.
                  </p>
                </div>
                <Button asChild size="sm" className="rounded-xl font-semibold">
                  <Link to="/properties">Explore Listings</Link>
                </Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishlistItems.map((item) => {
                const prop = item.property || {};
                const targetId = item.propertyId || item.id || prop.id;

                return (
                  <Card key={targetId} className="overflow-hidden rounded-2xl border-border shadow-xs flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="h-40 bg-muted relative overflow-hidden">
                        <img
                          src={prop.images?.[0]?.url || prop.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
                          alt={prop.title || 'Property'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeWishlist.mutate(targetId)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-heading font-bold text-base text-foreground line-clamp-1">
                          {prop.title || `Property #${targetId}`}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
                          {prop.locality ? `${prop.locality}, ` : ''}{prop.city || 'Noida'}
                        </p>

                        <p className="font-heading font-bold text-primary text-lg">
                          ₹ {Number(prop.price || 8500000).toLocaleString('en-IN')}
                        </p>

                        {item.notes && (
                          <div className="bg-muted/50 p-2.5 rounded-xl border border-border text-xs text-muted-foreground flex items-start space-x-1.5">
                            <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{item.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-border/50">
                      <span className="text-[11px] text-muted-foreground">
                        {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'Saved recently'}
                      </span>
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
                        <Link to={`/properties/${targetId}`}>View Details</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Discovery History Section */}
        <RecentlyViewedSection />

      </div>
    </div>
  );
};
