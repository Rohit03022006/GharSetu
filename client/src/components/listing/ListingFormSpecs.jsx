import React from 'react';
import { Input } from '@/components/ui/input';

export const ListingFormSpecs = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold">City</label>
          <Input
            placeholder="Noida"
            value={formData.city}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold">Locality</label>
          <Input
            placeholder="Sector 62"
            value={formData.locality}
            onChange={(e) => setFormData((prev) => ({ ...prev, locality: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold">Asking Price (₹)</label>
          <Input
            type="number"
            placeholder="8500000"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold">BHK Config</label>
          <Input
            type="number"
            placeholder="3"
            value={formData.bhk}
            onChange={(e) => setFormData((prev) => ({ ...prev, bhk: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};
