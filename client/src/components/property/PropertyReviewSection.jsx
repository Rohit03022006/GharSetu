import React, { useState } from 'react';
import { Star, MessageSquare, ShieldCheck, CornerDownRight, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSubmitReview, useReplyToReview } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export const PropertyReviewSection = ({ propertyId, reviews = [], avgRating = 0, totalReviews = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const submitReviewMutation = useSubmitReview();
  const replyReviewMutation = useReplyToReview();

  const isOwnerOrAdmin = user && (user.role === 'BUILDER' || user.role === 'BROKER' || user.role === 'ADMIN' || user.role === 'SELLER');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    if (!isAuthenticated) {
      setErrorMsg('Please sign in as a Buyer to submit a verified review.');
      return;
    }

    try {
      await submitReviewMutation.mutateAsync({
        propertyId,
        bookingId: bookingId.trim(),
        rating: Number(rating),
        comment: comment.trim()
      });
      setStatusMsg('Your review has been submitted successfully.');
      setComment('');
      setBookingId('');
    } catch (err) {
      if (err.apiErrorCode === 'VISIT_NOT_COMPLETED' || err.response?.status === 403) {
        setErrorMsg('Only verified buyers with a completed site visit can submit reviews for this property (FR-REV-01).');
      } else {
        setErrorMsg(err.message || 'Failed to submit review. Please ensure your booking ID is valid and completed.');
      }
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await replyReviewMutation.mutateAsync({
        reviewId,
        reply: replyText.trim()
      });
      setStatusMsg('Reply posted successfully.');
      setReplyText('');
      setReplyingToReviewId(null);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post reply.');
    }
  };

  return (
    <div className="space-y-6 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-heading font-bold flex items-center space-x-2 text-foreground">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Ratings & Verified Reviews</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified buyer feedback after physical site visits (FR-REV-01)
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200 dark:border-amber-900 w-fit">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(avgRating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="font-bold">{avgRating ? Number(avgRating).toFixed(1) : '5.0'}</span>
          <span className="text-xs font-normal text-muted-foreground">({totalReviews || reviews.length} reviews)</span>
        </div>
      </div>

      {/* Notifications */}
      {statusMsg && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Write a Review Card (Available to Buyers or unauthenticated users wanting to review) */}
      <form onSubmit={handleSubmit} className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-heading font-bold text-foreground">Write a Verified Buyer Review</h4>
          <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium">
            Requires Completed Visit ID
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Completed Visit Booking ID *</label>
            <Input
              type="text"
              required
              placeholder="e.g. bkg_01jm9..."
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="text-xs bg-muted/40"
            />
            <p className="text-[10px] text-muted-foreground">Found in your Buyer Dashboard under Completed Visits</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Rating Score</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-9 bg-muted/40 text-xs px-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars - Outstanding</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars - Very Good</option>
              <option value={3}>⭐⭐⭐ 3 Stars - Average</option>
              <option value={2}>⭐⭐ 2 Stars - Below Expectations</option>
              <option value={1}>⭐ 1 Star - Poor Experience</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Your Feedback & Experience *</label>
          <Textarea
            required
            rows={3}
            placeholder="Share details regarding the property condition, developer transparency, neighbourhood, and site visit experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-xs bg-muted/40"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitReviewMutation.isPending}
            className="text-xs font-semibold px-5"
          >
            {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Verified Review'}
          </Button>
        </div>
      </form>

      {/* Review List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-foreground">Recent Verified Customer Reviews</h4>
        
        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed border-border space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p className="text-xs font-medium text-muted-foreground">
              No reviews submitted yet. Completed site visitors can submit the first verified review!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {rev.user?.name?.[0]?.toUpperCase() || 'B'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {rev.user?.name || 'Verified Buyer'}
                        </span>
                        <span className="inline-flex items-center text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified Visit
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Verified Review'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">{rev.comment}</p>

                {/* Developer / Owner Reply (FR-REV-04) */}
                {rev.developerReply ? (
                  <div className="pl-4 border-l-2 border-primary/40 bg-muted/40 p-2.5 rounded-r-lg space-y-1">
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-primary">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Builder Response</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.developerReply}</p>
                  </div>
                ) : (
                  isOwnerOrAdmin && (
                    <div className="pt-2">
                      {replyingToReviewId === rev.id ? (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Write an official response to this buyer review..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="text-xs bg-background"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleReplySubmit(rev.id)}
                              disabled={replyReviewMutation.isPending}
                              className="text-xs h-7"
                            >
                              <Send className="w-3 h-3 mr-1" /> Send Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReplyingToReviewId(null)}
                              className="text-xs h-7"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingToReviewId(rev.id)}
                          className="text-xs h-6 text-primary hover:bg-primary/10 p-0 font-semibold"
                        >
                          + Reply as Developer / Builder
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
