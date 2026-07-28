import React, { useState } from 'react';
import { useVerifyOtp, useResendOtp } from '../../hooks/useApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, CheckCircle2, RefreshCw, User, Phone, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const VerifyOtpCard = () => {
  const location = useLocation();
  const initialUser = location.state?.user;

  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(location.state?.email || initialUser?.email || '');
  const [phone, setPhone] = useState(initialUser?.phone || '');
  const [role, setRole] = useState(initialUser?.role || 'BUYER');
  const [otp, setOtp] = useState('');
  
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    try {
      const res = await verifyOtpMutation.mutateAsync({ email, otp });
      setStatusMsg(res.message || 'Verification successful!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed');
    }
  };

  const handleResend = async () => {
    setStatusMsg('');
    setErrorMsg('');
    try {
      const res = await resendOtpMutation.mutateAsync({ email });
      setStatusMsg(res.message || 'New OTP sent to email');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <Card className="max-w-md w-full p-2 border-border shadow-sm">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-heading font-bold flex items-center justify-center space-x-2">
          <KeyRound className="w-6 h-6 text-primary" />
          <span>Account Verification & Profile</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Confirm your account details & enter the 6-digit OTP sent to your email.
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

        <form onSubmit={handleVerify} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Full Name</label>
            <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-lg border border-input">
              <User className="w-4 h-4 text-muted-foreground mr-2" />
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                className="border-none bg-transparent h-8 focus-visible:ring-0 p-0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Email Address</label>
            <Input
              type="email"
              required
              readOnly={!!initialUser?.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={initialUser?.email ? "bg-muted cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Phone Number</label>
            <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-lg border border-input">
              <Phone className="w-4 h-4 text-muted-foreground mr-2" />
              <Input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="border-none bg-transparent h-8 focus-visible:ring-0 p-0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Account Role</label>
            <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-lg border border-input">
              <Shield className="w-4 h-4 text-muted-foreground mr-2" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              >
                <option value="BUYER">Buyer (Search & Book Visits)</option>
                <option value="BROKER">Broker (Manage Leads)</option>
                <option value="BUILDER">Builder (List Projects)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold">6-Digit Verification OTP</label>
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

          <Button type="submit" disabled={verifyOtpMutation.isPending} className="w-full font-semibold">
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP & Complete Account'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="ghost" size="sm" onClick={handleResend} disabled={resendOtpMutation.isPending}>
          <RefreshCw className="w-4 h-4 mr-1" /> Resend OTP
        </Button>
        <Button variant="link" size="sm" onClick={() => navigate('/login')}>
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};
