import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export const configureGoogleOAuth = (prisma) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials missing. Skipping Passport Google Strategy initialization.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Check if user exists by googleId or email (for deduplication)
          let user = await prisma.user.findFirst({
            where: {
              OR: [{ googleId: profile.id }, { email: email }],
            },
          });

          if (!user) {
            // First time Google login defaults to BUYER role
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || 'Google User',
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
                role: 'BUYER', // Default role
                verificationStatus: 'UNVERIFIED',
              },
            });
          } else if (!user.googleId) {
            // Link Google ID to existing email account
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, avatarUrl: profile.photos?.[0]?.value || user.avatarUrl },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};
