import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

export const ListingFormBasic = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold">Property Title</label>
        <Input
          placeholder="e.g. 3 BHK Luxury Apartment in Sector 62"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold">Purpose</label>
          <NativeSelect
            value={formData.listingType}
            onChange={(e) => setFormData((prev) => ({ ...prev, listingType: e.target.value }))}
          >
            <option value="SALE">For Sale</option>
            <option value="RENT">For Rent</option>
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold">Property Type</label>
          <NativeSelect
            value={formData.propertyType}
            onChange={(e) => setFormData((prev) => ({ ...prev, propertyType: e.target.value }))}
          >
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="PLOT">Plot</option>
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold">Description</label>
        <Textarea
          placeholder="Provide highlights, amenities, connectivity..."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>
    </div>
  );
};
