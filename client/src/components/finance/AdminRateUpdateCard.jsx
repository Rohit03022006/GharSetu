import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Lock } from 'lucide-react';
import { useFinanceRates, useUpdateFinanceRate } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminRateUpdateCard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data: ratesResponse, isLoading, refetch } = useFinanceRates();
  const updateMutation = useUpdateFinanceRate();

  const [state, setState] = useState('MAHARASHTRA');
  const [stampDutyPercent, setStampDutyPercent] = useState(6.0);
  const [regPercent, setRegPercent] = useState(1.0);
  const [gstPercent, setGstPercent] = useState(5.0);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!isAdmin) {
      setMessage('Forbidden: Only platform ADMIN users can update state tax rates.');
      return;
    }
    try {
      const res = await updateMutation.mutateAsync({
        state,
        stampDutyPercent: Number(stampDutyPercent),
        regPercent: Number(regPercent),
        gstPercent: Number(gstPercent)
      });
      setMessage(`Successfully updated rates for ${state}!`);
      refetch();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error?.message || 'Failed to update rates. Insufficient admin privileges.');
    }
  };

  const rates = ratesResponse?.data?.data || ratesResponse?.data || [];

  if (!isAdmin) {
    return (
      <Card className="p-6 border-rose-200 bg-rose-50/30 text-center space-y-3">
        <div className="mx-auto w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="font-heading font-bold text-rose-900">Admin Privilege Required</h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          State Duty & Tax Rate overrides (`PUT /finance/rates`) are restricted strictly to platform administrators with an active ADMIN JWT token.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 border-amber-300 bg-amber-50/20">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-heading flex items-center space-x-2 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Admin State Duty Rate Management (RBAC: ADMIN)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">State Name</label>
            <Input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="MAHARASHTRA"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Stamp Duty (%)</label>
            <Input
              type="number"
              step="0.1"
              value={stampDutyPercent}
              onChange={(e) => setStampDutyPercent(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Registration (%)</label>
            <Input
              type="number"
              step="0.1"
              value={regPercent}
              onChange={(e) => setRegPercent(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">GST (%)</label>
            <Input
              type="number"
              step="0.1"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
            />
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" size="sm" className="w-full bg-amber-700 hover:bg-amber-800 text-white">
              Update State Rates (Admin Override)
            </Button>
          </div>
        </form>

        {message && (
          <p className="text-xs font-semibold text-center text-amber-800">{message}</p>
        )}

        <div className="space-y-2 pt-2 border-t border-amber-200">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Configured State Tax Rates</span>
            <button type="button" onClick={() => refetch()} className="flex items-center space-x-1 text-amber-700 hover:underline">
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading state rates...</p>
          ) : Array.isArray(rates) && rates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {rates.map((r) => (
                <div key={r.id || r.state} className="p-2 bg-white rounded border border-amber-200 text-xs">
                  <div className="font-bold text-amber-900">{r.state}</div>
                  <div className="text-muted-foreground text-[11px]">
                    Stamp: {r.stampDutyPercent}% | Reg: {r.regPercent}% | GST: {r.gstPercent}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No custom state rates found (Using system default 6% / 1%).</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
