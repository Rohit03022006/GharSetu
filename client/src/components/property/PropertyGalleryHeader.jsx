import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Heart, Calendar, CheckCircle2 } from 'lucide-react';
import { useToggleWishlist, useCreateBooking } from '../../hooks/useApi';
import { PropertyShareModal } from './PropertyShareModal';

export const PropertyGalleryHeader = ({ prop, isSaved, setIsSaved }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingMsg, setBookingMsg] = useState('');

  const toggleWishlistMutation = useToggleWishlist();
  const createBookingMutation = useCreateBooking();

  const handleWishlist = async () => {
    const targetId = prop?.id || prop?._id;
    if (!targetId) return;
    try {
      await toggleWishlistMutation.mutateAsync(targetId);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookVisit = async (e) => {
    e.preventDefault();
    try {
      await createBookingMutation.mutateAsync({
        propertyId: prop.id,
        scheduledDate: `${bookingDate} ${bookingTime}`
      });
      setBookingMsg('Visit scheduled successfully!');
    } catch (err) {
      setBookingMsg('Booking failed: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Gallery & Title */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-96 border-border overflow-hidden relative shadow-xs">
          <img
            src={prop.images?.[0]?.url || prop.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'}
            alt={prop.title}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
            {prop.listingType || 'FOR SALE'}
          </Badge>
        </Card>

        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">{prop.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1 text-primary" />
            {prop.city}, {prop.address || prop.locality}
          </p>
        </div>
      </div>

      {/* Pricing & Booking Card */}
      <div>
        <Card className="p-6 sticky top-20 space-y-6">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-bold">Asking Price</span>
            <div className="text-3xl font-heading font-bold text-primary">
              ₹ {Number(prop.price || 8500000).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant={isSaved ? 'default' : 'outline'}
              className="flex-1 text-xs"
              onClick={handleWishlist}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved in Wishlist' : 'Save Property'}
            </Button>
          </div>

          {/* Public Share Metadata Modal (FR-PROP-08) */}
          <PropertyShareModal propertyId={prop.id} title={prop.title} />

          <div className="pt-4 border-t border-border space-y-3">
            <h3 className="text-sm font-heading font-bold flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              Schedule Physical Visit
            </h3>

            {bookingMsg && (
              <div className="p-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{bookingMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookVisit} className="space-y-3">
              <Input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" size="sm" className="w-full bg-accent text-accent-foreground">
                Confirm Site Visit
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
