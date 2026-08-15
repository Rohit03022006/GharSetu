import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Heart, Calendar, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { useToggleWishlist, useCreateBooking, usePropertyAvailability } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { PropertyShareModal } from './PropertyShareModal';

export const PropertyGalleryHeader = ({ prop, isSaved, setIsSaved }) => {
  const { isAuthenticated } = useAuth();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingError, setBookingError] = useState('');

  const propertyId = prop?.id || prop?._id;
  const toggleWishlistMutation = useToggleWishlist();
  const createBookingMutation = useCreateBooking();
  const { data: availabilityData } = usePropertyAvailability(propertyId);

  const rawSlots = availabilityData?.data || availabilityData || [];
  const activeSlots = Array.isArray(rawSlots) ? rawSlots.filter(s => !s.isBooked && (!bookingDate || s.date?.startsWith(bookingDate))) : [];

  const images = Array.isArray(prop.images) && prop.images.length > 0
    ? prop.images.map(img => (typeof img === 'string' ? img : img.url || ''))
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'];

  const handleWishlist = async () => {
    if (!propertyId) return;
    try {
      await toggleWishlistMutation.mutateAsync(propertyId);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookVisit = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    setBookingError('');

    if (!isAuthenticated) {
      setBookingError('Please sign in to schedule a site visit.');
      return;
    }

    try {
      await createBookingMutation.mutateAsync({
        propertyId,
        slotId: selectedSlotId || undefined,
        scheduledDate: bookingDate ? new Date(bookingDate).toISOString() : new Date().toISOString()
      });
      setBookingMsg('Visit scheduled successfully! Check your Buyer Dashboard.');
      setBookingDate('');
      setSelectedSlotId('');
    } catch (err) {
      if (err.apiErrorCode === 'SLOT_ALREADY_BOOKED' || err.message?.includes('already booked')) {
        setBookingError('This time slot has just been booked by another buyer. Please choose another time.');
      } else {
        setBookingError(err.message || 'Failed to schedule site visit.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Gallery & Property Details */}
      <div className="lg:col-span-2 space-y-4">
        {/* Main Banner Image */}
        <Card className="h-[400px] border-border overflow-hidden relative shadow-md rounded-2xl group">
          <img
            src={images[selectedImageIdx] || images[0]}
            alt={prop.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 shadow-md">
              {prop.listingType || 'FOR SALE'}
            </Badge>
            {prop.reraApproved && (
              <Badge className="bg-emerald-600 text-white font-semibold px-3 py-1 flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" /> RERA Approved
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
            Photo {selectedImageIdx + 1} of {images.length}
          </div>
        </Card>

        {/* Thumbnail Gallery Row */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIdx(idx)}
                className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  selectedImageIdx === idx ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Title, Locality & Developer Details */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>{prop.propertyType || 'APARTMENT'}</span>
            <span>•</span>
            <span>{prop.bedrooms ? `${prop.bedrooms} BHK` : 'Residential'}</span>
            <span>•</span>
            <span>{prop.furnishingStatus || 'Semi-Furnished'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mt-1">
            {prop.title}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center mt-1.5">
            <MapPin className="w-4 h-4 mr-1 text-primary shrink-0" />
            {prop.locality ? `${prop.locality}, ` : ''}{prop.city}, {prop.state || 'India'}
          </p>
        </div>
      </div>

      {/* Pricing & Booking Card */}
      <div>
        <Card className="p-6 sticky top-20 space-y-6 shadow-md rounded-2xl border-border">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Asking Price</span>
            <div className="text-3xl font-heading font-bold text-primary mt-0.5">
              ₹ {Number(prop.price || 8500000).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹ {Math.round((prop.price || 8500000) / (prop.areaSqFt || 1200)).toLocaleString('en-IN')} / sq.ft
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant={isSaved ? 'default' : 'outline'}
              className="flex-1 text-xs font-semibold h-10 rounded-xl"
              onClick={handleWishlist}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
              {isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
            </Button>
          </div>

          {/* Public Share Modal */}
          <PropertyShareModal propertyId={prop.id} title={prop.title} />

          {/* Schedule Physical Site Visit (FR-BOOK-01, FR-BOOK-02) */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold flex items-center text-foreground">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                Schedule Physical Visit
              </h3>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                Free Visit
              </span>
            </div>

            {bookingMsg && (
              <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{bookingMsg}</span>
              </div>
            )}

            {bookingError && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookVisit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Select Visit Date</label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="text-xs bg-muted/40"
                />
              </div>

              {activeSlots.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-primary" /> Available Time Slot
                  </label>
                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full h-9 bg-muted/40 text-xs px-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Choose slot (or default to morning)</option>
                    {activeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.startTime || '10:00 AM'} - {slot.endTime || '11:00 AM'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={createBookingMutation.isPending}
                className="w-full font-semibold bg-primary text-primary-foreground h-10 rounded-xl shadow-xs"
              >
                {createBookingMutation.isPending ? 'Confirming Visit...' : 'Confirm Site Visit'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
