import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useCalculateRentAffordability } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatIndianNumber, numberToWordsINR } from '../../utils/numberFormat';

export const RentAffordabilityCard = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(120000);
  const [existingDebts, setExistingDebts] = useState(15000);
  const [result, setResult] = useState(null);

  const rentMutation = useCalculateRentAffordability();

  const handleCalculate = async (e) => {
    e?.preventDefault();
    try {
      const res = await rentMutation.mutateAsync({
        monthlyIncome: Number(monthlyIncome),
        existingEmi: Number(existingDebts)
      });
      setResult(res.data?.data || res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-6 space-y-4 border-border">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-heading flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span>Rental Affordability Index</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Net Monthly Income (₹)</label>
            <Input
              type="text"
              value={formatIndianNumber(monthlyIncome)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (!isNaN(raw)) setMonthlyIncome(raw);
              }}
              placeholder="e.g. 1,20,000"
            />
            {monthlyIncome > 0 && (
              <p className="text-[11px] font-medium text-emerald-600 font-mono">
                ₹ {formatIndianNumber(monthlyIncome)} ({numberToWordsINR(monthlyIncome)})
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Existing Monthly EMIs (₹)</label>
            <Input
              type="text"
              value={formatIndianNumber(existingDebts)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (!isNaN(raw)) setExistingDebts(raw);
              }}
              placeholder="e.g. 15,000"
            />
            {existingDebts > 0 && (
              <p className="text-[11px] font-medium text-emerald-600 font-mono">
                ₹ {formatIndianNumber(existingDebts)} ({numberToWordsINR(existingDebts)})
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="w-full"
              disabled={rentMutation.isPending}
            >
              {rentMutation.isPending ? 'Calculating...' : 'Calculate Safe Rent Budget'}
            </Button>
          </div>
        </form>

        {result && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-xl grid grid-cols-2 gap-3 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                Recommended Safe Rent (30%)
              </span>
              <div className="text-lg font-heading font-bold text-emerald-800 dark:text-emerald-100">
                ₹ {Number(result.maxRecommendedRent || 0).toLocaleString('en-IN')} / mo
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                Max Aggressive Cap (40%)
              </span>
              <div className="text-lg font-heading font-bold text-emerald-800 dark:text-emerald-100">
                ₹ {Number(result.maxAggressiveRent || 0).toLocaleString('en-IN')} / mo
              </div>
            </div>
            <p className="col-span-2 text-[11px] text-emerald-700 dark:text-emerald-300 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
              Disposable monthly income: ₹{Number(result.netAvailableIncome || (monthlyIncome - existingDebts)).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
