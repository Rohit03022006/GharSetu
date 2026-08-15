import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../services/password.service.js';

export const seedDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { role: 'ADMIN' }
        ]
      }
    });

    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPassword);
      await prisma.user.create({
        data: {
          name: 'Platform Admin',
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
          verificationStatus: 'VERIFIED',
          isActive: true
        }
      });
      console.log(`Default Admin account initialized for [${adminEmail}]`);
    }
  } catch (error) {
    console.error('Failed to initialize default admin user:', error);
  }
};
