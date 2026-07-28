import * as preferenceService from '../services/preference.service.js';
import * as validator from '../validators/preference.validators.js';

export const addWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const validated = validator.addWishlistSchema.parse(req.body);

    const { wishlist, isNew } = await preferenceService.addToWishlist(userId, validated.propertyId, validated.notes);

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Property added to wishlist' : 'Property is already in wishlist',
      data: wishlist
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const removeWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { propertyId } = req.params;

    const removed = await preferenceService.removeFromWishlist(userId, propertyId);

    if (!removed) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Wishlist item not found' } });
    }

    res.json({ success: true, message: 'Property removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const wishlist = await preferenceService.getUserWishlist(userId);

    res.json({ success: true, count: wishlist.length, data: wishlist });
  } catch (error) {
    next(error);
  }
};

export const compareProperties = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const validated = validator.comparePropertiesSchema.parse(req.body);

    const comparisonData = await preferenceService.compareProperties(userId, validated.propertyIds);

    res.json({
      success: true,
      count: comparisonData.length,
      data: comparisonData
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};
