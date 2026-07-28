import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode') || 'login';
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userStr = searchParams.get('user');

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        login({ accessToken, refreshToken, user });

        if (mode === 'register' && (!user.isEmailVerified || !user.phone)) {
          // Explicit registration flow: navigate to verification page to enter details and OTP
          navigate('/verify-otp', { state: { email: user.email, user } });
        } else {
          // Direct login flow: redirect straight to role-specific workspace
          const role = user.role?.toUpperCase();
          if (role === 'BROKER') navigate('/broker');
          else if (role === 'BUILDER' || role === 'SELLER') navigate('/builder');
          else if (role === 'ADMIN') navigate('/admin');
          else navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to parse OAuth user:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-semibold text-muted-foreground">Completing Google Sign In...</p>
    </div>
  );
};
