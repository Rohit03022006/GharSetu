import { getBuilderMetrics, getAdminPlatformMetrics } from '../services/analyticsQueries.service.js';

export const getBuilderDashboardHandler = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const data = await getBuilderMetrics(ownerId);
    return res.status(200).json({
      success: true,
      message: 'Builder analytics retrieved successfully',
      data
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

export const getAdminDashboardHandler = async (req, res) => {
  try {
    const data = await getAdminPlatformMetrics();
    return res.status(200).json({
      success: true,
      message: 'Platform admin analytics retrieved successfully',
      data
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};
