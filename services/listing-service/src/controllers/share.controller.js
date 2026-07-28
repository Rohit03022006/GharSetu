import { getPublicShareMetadataService } from '../services/share.service.js';

export const getPublicShareMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shareData = await getPublicShareMetadataService(id);

    if (!shareData) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found or not approved for public sharing' } });
    }

    res.json({ success: true, data: shareData });
  } catch (error) {
    next(error);
  }
};
