import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile, useUpdateProfile } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const ProfileSettingsCard = () => {
  const { user, updateUser } = useAuth();
  const { data: profileData, isLoading, error } = useUserProfile();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const profile = profileData?.data || profileData || user || {};

  useEffect(() => {
    if (profile.name) setName(profile.name);
    if (profile.phone) setPhone(profile.phone);
  }, [profile.name, profile.phone]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await updateMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim()
      });
      const updatedUser = res?.data || res || { ...user, name, phone };
      updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs">
          {error.message || 'Failed to load user profile from Identity Service'}
        </div>
      )}

      <Card className="rounded-2xl border-border shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading font-bold text-base text-foreground flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Identity Profile Credentials</span>
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5 text-xs">
              {profile.role || 'BUYER'}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Real authenticated profile parameters synced with PostgreSQL database.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address (Immutable)</label>
              <Input
                value={profile.email || ''}
                disabled
                className="h-10 rounded-xl text-xs bg-muted/60 text-muted-foreground font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Contact Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="rounded-xl text-xs font-semibold h-10 px-5"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
