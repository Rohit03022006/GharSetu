import { searchPropertiesService } from '../services/search.service.js';

export const searchProperties = async (req, res, next) => {
  try {
    const result = await searchPropertiesService(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
