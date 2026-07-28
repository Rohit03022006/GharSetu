import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const ProfileSettingsCard = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
          Profile changes updated successfully.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Account Credentials</span>
            <Badge className="bg-primary text-primary-foreground">{user?.role || 'BUYER'}</Badge>
          </CardTitle>
          <CardDescription className="text-xs">Role-aware profile attributes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Full Name</label>
              <Input defaultValue={user?.name || 'Rohit Sharma'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Address</label>
              <Input defaultValue={user?.email || 'rohit@example.com'} disabled className="bg-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Contact Phone</label>
              <Input defaultValue={user?.phone || '+91 9876543210'} />
            </div>
            <Button type="submit" size="sm">
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
