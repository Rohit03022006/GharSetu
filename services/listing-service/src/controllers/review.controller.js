import * as validator from '../validators/review.validators.js';
import * as reviewService from '../services/review.service.js';

export const submitReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = validator.createReviewSchema.parse(req.body);

    const review = await reviewService.createReviewService(id, req.user, validated);
    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    if (error.code === 'VISIT_NOT_COMPLETED') {
      return res.status(403).json({ error: { code: 'VISIT_NOT_COMPLETED', message: error.message } });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: { code: 'DUPLICATE_REVIEW', message: 'You have already reviewed this booking' } });
    }
    next(error);
  }
};

export const replyToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const validated = validator.reviewReplySchema.parse(req.body);

    const updated = await reviewService.replyToReviewService(reviewId, req.user.id, validated.replyText);
    res.json({ success: true, message: 'Reply submitted successfully', data: updated });
  } catch (error) {
    if (error.message.startsWith('NOT_FOUND')) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review not found' } });
    }
    if (error.message.startsWith('FORBIDDEN')) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only property owner can reply to reviews' } });
    }
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { isHidden } = req.body;

    const updated = await reviewService.moderateReviewService(reviewId, Boolean(isHidden));
    res.json({ success: true, message: `Review ${isHidden ? 'hidden' : 'unhidden'} by Admin`, data: updated });
  } catch (error) {
    next(error);
  }
};
