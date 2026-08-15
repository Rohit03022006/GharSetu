import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const submitDocSchema = z.object({
  docType: z.enum(['RERA_CERTIFICATE', 'AADHAAR', 'PAN', 'BUILDER_LICENSE', 'BUSINESS_REGISTRATION', 'OTHER']),
  fileUrl: z.string().url().max(2000)
});

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
        userDocs: {
          select: {
            id: true,
            docType: true,
            fileUrl: true,
            uploadedAt: true
          }
        },
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
    const { docType, fileUrl } = submitDocSchema.parse(req.body);
    const userId = req.user.userId || req.user.id;

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
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Document submission failed.' } });
  }
};
