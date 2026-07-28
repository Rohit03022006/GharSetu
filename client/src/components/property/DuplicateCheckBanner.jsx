import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useCheckDuplicateListings } from '../../hooks/useApi';
import { Button } from '@/components/ui/button';

export const DuplicateCheckBanner = ({ formData }) => {
  const [duplicates, setDuplicates] = useState([]);
  const [checked, setChecked] = useState(false);
  const checkDuplicateMutation = useCheckDuplicateListings();

  const handleCheck = async () => {
    try {
      const res = await checkDuplicateMutation.mutateAsync({
        address: formData.locality || formData.city,
        price: Number(formData.price || 0),
        areaSqFt: Number(formData.carpetArea || 1000)
      });
      setDuplicates(res.duplicates || []);
      setChecked(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold font-heading flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Anti-Fraud Duplicate Detection</span>
        </h4>
        <Button size="xs" variant="outline" onClick={handleCheck} disabled={checkDuplicateMutation.isPending}>
          {checkDuplicateMutation.isPending ? 'Checking...' : 'Run Fraud Scan'}
        </Button>
      </div>

      {checked && duplicates.length === 0 && (
        <div className="p-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded flex items-center space-x-1">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>No duplicate properties detected within +/-5% price range. Safe to submit!</span>
        </div>
      )}

      {checked && duplicates.length > 0 && (
        <div className="p-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded space-y-1">
          <div className="flex items-center space-x-1 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Warning: {duplicates.length} Potential Duplicate(s) Found!</span>
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            {duplicates.map((d) => (
              <li key={d.id}>
                <span className="font-semibold">{d.title}</span> - ₹{Number(d.price).toLocaleString('en-IN')} ({d.address})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
