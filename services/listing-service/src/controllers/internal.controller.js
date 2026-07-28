import { getInternalPropertyByIdService } from '../services/internal.service.js';

export const getInternalPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await getInternalPropertyByIdService(id);

    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};
