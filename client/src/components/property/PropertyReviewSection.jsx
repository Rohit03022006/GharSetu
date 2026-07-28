import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useSubmitReview } from '../../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const PropertyReviewSection = ({ propertyId, reviews = [], avgRating = 0, totalReviews = 0 }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const submitReviewMutation = useSubmitReview();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitReviewMutation.mutateAsync({ propertyId, bookingId, rating, comment });
      setStatusMsg('Review submitted successfully!');
      setComment('');
    } catch (err) {
      setStatusMsg('Review submission failed: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-bold flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Ratings & Verified Reviews</span>
          </h3>
          <p className="text-xs text-muted-foreground">FR-REV-01 Verified Buyer Feedback</p>
        </div>
        <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{avgRating ? avgRating.toFixed(1) : 'New'}</span>
          <span className="text-muted-foreground">({totalReviews})</span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
          {statusMsg}
        </div>
      )}

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="bg-card p-4 rounded-xl border border-border space-y-3">
        <h4 className="text-xs font-bold text-foreground">Write a Review</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground">Completed Booking ID</label>
            <input
              type="text"
              required
              placeholder="e.g. bkg-987"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full bg-background text-xs p-2 rounded border border-border"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground">Rating (1-5)</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full bg-background text-xs p-2 rounded border border-border"
            >
              <option value={5}>5 Stars - Outstanding</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Average</option>
              <option value={2}>2 Stars - Poor</option>
              <option value={1}>1 Star - Bad</option>
            </select>
          </div>
        </div>
        <Textarea
          placeholder="Share details of your site visit and developer experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="text-xs"
        />
        <Button type="submit" size="sm" disabled={submitReviewMutation.isPending}>
          Submit Verified Review
        </Button>
      </form>
    </div>
  );
};
