import React, { useState } from 'react';
import { Calculator, IndianRupee, PieChart } from 'lucide-react';
import { useCalculateEmi } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatIndianNumber, numberToWordsINR } from '../../utils/numberFormat';

export const EmiCalculatorCard = ({ initialPrice = 8500000 }) => {
  const [loanAmount, setLoanAmount] = useState(initialPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const [result, setResult] = useState(null);
  const calculateEmiMutation = useCalculateEmi();

  const handleCalculate = async (e) => {
    e?.preventDefault();
    try {
      const res = await calculateEmiMutation.mutateAsync({
        loanAmount: Number(loanAmount),
        annualInterestRate: Number(interestRate),
        tenureYears: Number(tenureYears)
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
          <Calculator className="w-5 h-5 text-primary" />
          <span>Home Loan EMI Calculator</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Loan Amount (₹)</label>
            <Input
              type="text"
              value={formatIndianNumber(loanAmount)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (!isNaN(raw)) setLoanAmount(raw);
              }}
              placeholder="e.g. 50,00,000"
            />
            {loanAmount > 0 && (
              <p className="text-[11px] font-medium text-primary font-mono">
                ₹ {formatIndianNumber(loanAmount)} ({numberToWordsINR(loanAmount)})
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Interest Rate (%)</label>
            <Input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Tenure (Years)</label>
            <Input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" size="sm" className="w-full bg-primary text-primary-foreground" disabled={calculateEmiMutation.isPending}>
              {calculateEmiMutation.isPending ? 'Calculating...' : 'Calculate Monthly EMI'}
            </Button>
          </div>
        </form>

        {result && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Monthly EMI</span>
              <div className="text-lg font-heading font-bold text-primary">
                ₹ {Number(result.monthlyEmi || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Interest</span>
              <div className="text-sm font-bold text-foreground">
                ₹ {Number(result.totalInterest || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Payment</span>
              <div className="text-sm font-bold text-foreground">
                ₹ {Number(result.totalPayment || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
