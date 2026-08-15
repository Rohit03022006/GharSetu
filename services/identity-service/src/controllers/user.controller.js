import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).max(15).optional(),
  avatarUrl: z.string().url().optional()
});

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'BUILDER', 'BROKER', 'BUYER'])
});

const updateStatusSchema = z.object({
  isActive: z.boolean()
});

// GET /users/me - Retrieve current authenticated user profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isEmailVerified: true,
        verificationStatus: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userDocs: {
          select: {
            id: true,
            docType: true,
            fileUrl: true,
            uploadedAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch user profile.' } });
  }
};

// PATCH /users/me - Update authenticated user's own profile
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isEmailVerified: true,
        verificationStatus: true,
        avatarUrl: true,
        isActive: true,
        updatedAt: true
      }
    });

    return res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update profile.' } });
  }
};

// GET /admin/users - List all users with pagination and search filters (Admin Only)
export const listAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { role, verificationStatus, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          isEmailVerified: true,
          verificationStatus: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch users list.' } });
  }
};

// PATCH /admin/users/:userId/role - Update user role (Admin Only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = updateRoleSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationStatus: true,
        isActive: true
      }
    });

    return res.json({ message: `User role updated to ${role}.`, user });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update user role.' } });
  }
};

// PATCH /admin/users/:userId/status - Activate/Deactivate user (Admin Only)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = updateStatusSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    return res.json({ message: `User status updated to ${isActive ? 'active' : 'inactive'}.`, user });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update user status.' } });
  }
};
