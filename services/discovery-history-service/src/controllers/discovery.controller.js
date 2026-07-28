import * as discoveryService from '../services/discovery.service.js';
import * as validator from '../validators/discovery.validators.js';

export const logView = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const validated = validator.logViewSchema.parse(req.body);

    const logResult = await discoveryService.logPropertyView(userId, validated.propertyId);

    res.status(201).json({
      success: true,
      message: 'Property view logged',
      data: logResult
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const items = await discoveryService.getRecentlyViewed(userId);

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const logSearch = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const validated = validator.logSearchSchema.parse(req.body);

    const logResult = await discoveryService.logSearchHistory(userId, validated.filters);

    res.status(201).json({
      success: true,
      message: 'Search history logged',
      data: logResult
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getSearchHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const history = await discoveryService.getSearchHistory(userId);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProperties = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const similar = await discoveryService.getSimilarProperties(propertyId);

    res.json({
      success: true,
      count: similar.length,
      data: similar
    });
  } catch (error) {
    next(error);
  }
};
