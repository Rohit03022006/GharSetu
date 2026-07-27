import { prisma } from '../lib/prisma.js';

export const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        verificationDocs: true,
      }
    });

    return res.json({ verifications: pendingUsers });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch verifications.' } });
  }
};

export const approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: 'VERIFIED' }
    });

    return res.json({ message: 'User verification approved.', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Approval failed.' } });
  }
};

export const rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: 'REJECTED' }
    });

    return res.json({ message: 'User verification rejected.', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Rejection failed.' } });
  }
};

export const submitVerificationDoc = async (req, res) => {
  try {
    const { docType, fileUrl } = req.body;
    const userId = req.user.userId;

    const doc = await prisma.verificationDocument.create({
      data: {
        userId,
        docType,
        fileUrl,
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: 'PENDING' }
    });

    return res.status(201).json({ message: 'Document submitted for verification.', doc });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Document submission failed.' } });
  }
};
