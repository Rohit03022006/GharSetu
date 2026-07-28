import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useCalculateMaintenance } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';

export const MaintenanceCostCard = () => {
  const [areaSqFt, setAreaSqFt] = useState(1200);
  const [cityTier, setCityTier] = useState('TIER_1');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [result, setResult] = useState(null);

  const maintenanceMutation = useCalculateMaintenance();

  const handleCalculate = async (e) => {
    e?.preventDefault();
    try {
      const res = await maintenanceMutation.mutateAsync({
        areaSqFt: Number(areaSqFt),
        cityTier,
        propertyType
      });
      setResult(res.data?.data || res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-6 space-y-4 border-border shadow-sm">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-heading flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <span>Maintenance Cost Estimator</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Carpet Area (sq. ft.)</label>
            <Input
              type="number"
              value={areaSqFt}
              onChange={(e) => setAreaSqFt(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">City Classification</label>
            <NativeSelect value={cityTier} onChange={(e) => setCityTier(e.target.value)}>
              <option value="TIER_1">Tier 1 (Metro / Mega City)</option>
              <option value="TIER_2">Tier 2 (Growth Hub)</option>
              <option value="TIER_3">Tier 3 (Emerging)</option>
            </NativeSelect>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Property Typology</label>
            <NativeSelect value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              <option value="APARTMENT">Apartment Complex</option>
              <option value="VILLA">Gated Villa</option>
              <option value="INDEPENDENT_HOUSE">Independent House</option>
              <option value="PLOT">Residential Plot</option>
            </NativeSelect>
          </div>
          <div className="sm:col-span-3">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="w-full"
              disabled={maintenanceMutation.isPending}
            >
              {maintenanceMutation.isPending ? 'Estimating...' : 'Estimate Monthly Maintenance'}
            </Button>
          </div>
        </form>

        {result && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-xl grid grid-cols-2 gap-2 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
                Monthly Maintenance ({result.ratePerSqFtRange || 'Est'})
              </span>
              <div className="text-base font-heading font-bold text-indigo-900 dark:text-indigo-100">
                ₹ {Number(result.monthlyMin || 0).toLocaleString('en-IN')} - ₹ {Number(result.monthlyMax || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
                Yearly Maintenance Total
              </span>
              <div className="text-base font-heading font-bold text-indigo-900 dark:text-indigo-100">
                ₹ {Number(result.yearlyMin || 0).toLocaleString('en-IN')} - ₹ {Number(result.yearlyMax || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
