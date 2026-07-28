import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useCalculateStampDuty, useCalculateGst } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatIndianNumber, numberToWordsINR } from '../../utils/numberFormat';

export const StampDutyGstCard = ({ initialPrice = 8500000 }) => {
  const [price, setPrice] = useState(initialPrice);
  const [state, setState] = useState('MAHARASHTRA');
  const [gender, setGender] = useState('male');
  const [constructionStatus, setConstructionStatus] = useState('UNDER_CONSTRUCTION');

  const [stampDutyResult, setStampDutyResult] = useState(null);
  const [gstResult, setGstResult] = useState(null);

  const stampDutyMutation = useCalculateStampDuty();
  const gstMutation = useCalculateGst();

  const handleCalculateAll = async (e) => {
    e?.preventDefault();
    try {
      const stampRes = await stampDutyMutation.mutateAsync({
        propertyPrice: Number(price),
        state
      });
      const stampData = stampRes.data?.data || stampRes.data || stampRes;

      // Apply 1% female concession if selected
      if (gender === 'female' && stampData.stampDutyPercent > 0) {
        const concessionPercent = Math.max(0, stampData.stampDutyPercent - 1);
        const concessionDuty = Math.round((Number(price) * concessionPercent) / 100);
        setStampDutyResult({
          ...stampData,
          effectiveStampDutyPercent: concessionPercent,
          stampDutyAmount: concessionDuty,
          totalGovernmentCharges: concessionDuty + stampData.regAmount,
          concessionApplied: true
        });
      } else {
        setStampDutyResult(stampData);
      }

      const gstRes = await gstMutation.mutateAsync({
        propertyPrice: Number(price),
        constructionStatus,
        state
      });
      const gstData = gstRes.data?.data || gstRes.data || gstRes;
      setGstResult(gstData);
    } catch (err) {
      console.error('Calculation error:', err);
    }
  };

  return (
    <Card className="p-6 space-y-4 border-border">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-heading flex items-center space-x-2">
          <FileText className="w-5 h-5 text-accent" />
          <span>Stamp Duty & GST Estimator</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleCalculateAll} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Property Value (₹)</label>
            <Input
              type="text"
              value={formatIndianNumber(price)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (!isNaN(raw)) setPrice(raw);
              }}
              placeholder="e.g. 85,00,000"
            />
            {price > 0 && (
              <p className="text-[11px] font-medium text-primary font-mono">
                ₹ {formatIndianNumber(price)} ({numberToWordsINR(price)})
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">State / Union Territory</label>
            <NativeSelect value={state} onChange={(e) => setState(e.target.value)}>
              <option value="MAHARASHTRA">Maharashtra (5%)</option>
              <option value="KARNATAKA">Karnataka (5%)</option>
              <option value="DELHI">Delhi (6%)</option>
              <option value="UTTAR_PRADESH">Uttar Pradesh (7%)</option>
              <option value="HARYANA">Haryana (6%)</option>
              <option value="GUJARAT">Gujarat (4.9%)</option>
            </NativeSelect>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Buyer Gender (Concession)</label>
            <NativeSelect value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male (Standard Rate)</option>
              <option value="female">Female (1% Rebate)</option>
              <option value="joint">Joint</option>
            </NativeSelect>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Construction Status</label>
            <NativeSelect value={constructionStatus} onChange={(e) => setConstructionStatus(e.target.value)}>
              <option value="UNDER_CONSTRUCTION">Under Construction (5% GST)</option>
              <option value="READY_TO_MOVE">Ready to Move (0% GST / Exempt)</option>
            </NativeSelect>
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="w-full"
              disabled={stampDutyMutation.isPending || gstMutation.isPending}
            >
              {stampDutyMutation.isPending || gstMutation.isPending ? 'Calculating...' : 'Calculate Legal & Tax Duties'}
            </Button>
          </div>
        </form>

        {(stampDutyResult || gstResult) && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Stamp Duty ({stampDutyResult?.effectiveStampDutyPercent ?? stampDutyResult?.stampDutyPercent ?? 5}%)
                  {stampDutyResult?.concessionApplied && <span className="text-emerald-600 block text-[9px]">(1% Female Rebate)</span>}
                </span>
                <div className="text-base font-heading font-bold text-foreground">
                  ₹ {Number(stampDutyResult?.stampDutyAmount || 0).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  Reg: ₹ {Number(stampDutyResult?.regAmount || 0).toLocaleString('en-IN')} ({stampDutyResult?.regPercent || 1}%)
                </span>
              </div>
              <div className="p-3 bg-muted rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  GST ({gstResult?.gstPercent || 0}%)
                </span>
                <div className="text-base font-heading font-bold text-foreground">
                  ₹ {Number(gstResult?.gstAmount || 0).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  {gstResult?.isGstApplicable ? 'Under Construction' : 'Exempt (Ready-to-Move)'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">Total Govt Tax & Registration Charges:</span>
              <span className="font-heading font-bold text-primary text-sm">
                ₹ {((stampDutyResult?.totalGovernmentCharges || 0) + (gstResult?.gstAmount || 0)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
