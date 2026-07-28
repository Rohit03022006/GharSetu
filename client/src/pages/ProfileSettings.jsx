import React from 'react';
import { ProfileSettingsCard } from '../components/auth/ProfileSettingsCard';

export const ProfileSettings = () => {
  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Profile & Account Settings</h1>
          <p className="text-sm text-muted-foreground">Manage role permissions, notifications, and identity parameters.</p>
        </div>
        <ProfileSettingsCard />
      </div>
    </div>
  );
};
