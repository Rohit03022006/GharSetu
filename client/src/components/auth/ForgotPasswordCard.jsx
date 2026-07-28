import React, { useState } from 'react';
import { useForgotPassword, useResetPasswordWithOtp } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ForgotPasswordCard = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPasswordWithOtp();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await forgotMutation.mutateAsync({ email });
      setStatusMsg(res.message || 'Reset OTP sent to email');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Request failed');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await resetMutation.mutateAsync({ email, otp, newPassword });
      setStatusMsg(res.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed');
    }
  };

  return (
    <Card className="max-w-md w-full p-2">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading font-bold flex items-center justify-center space-x-2">
          <Lock className="w-6 h-6 text-primary" />
          <span>{step === 1 ? 'Forgot Password' : 'Reset Password'}</span>
        </CardTitle>
        <CardDescription className="text-xs">
          {step === 1 ? 'Enter email to receive a password reset OTP' : 'Enter OTP and set your new password'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {statusMsg && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 text-destructive border border-destructive rounded-lg">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={forgotMutation.isPending} className="w-full">
              {forgotMutation.isPending ? 'Sending OTP...' : 'Send Reset OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Reset OTP</label>
              <Input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="text-center tracking-widest font-mono text-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">New Password</label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={resetMutation.isPending} className="w-full">
              {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
