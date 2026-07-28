import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const PropertyFinanceTabs = ({ prop }) => {
  return (
    <Card className="p-6">
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Specifications</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="finance">Loan & EMI Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground block">Carpet Area</span>
              <span className="font-bold text-foreground">{prop.areaSqFt || 1200} sqft</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground block">Bedrooms</span>
              <span className="font-bold text-foreground">{prop.bedrooms || 3} BHK</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground block">Furnishing</span>
              <span className="font-bold text-foreground">{prop.furnishingStatus || 'Semi-Furnished'}</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground block">Status</span>
              <span className="font-bold text-foreground">{prop.constructionStatus || 'Ready to Move'}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pt-2 leading-relaxed">
            {prop.description || 'Premium residential property with ultra-modern specifications and high accessibility.'}
          </p>
        </TabsContent>

        <TabsContent value="amenities" className="pt-4">
          <div className="flex flex-wrap gap-2">
            {['24/7 Security', 'Power Backup', 'Club House', 'Swimming Pool', 'Gymnasium', 'Covered Parking'].map((a, i) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {a}
              </span>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finance" className="pt-4 space-y-4">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl space-y-2">
            <span className="text-xs font-bold text-accent-foreground">Estimated Monthly EMI (20 Yrs @ 8.5%)</span>
            <div className="text-2xl font-heading font-bold text-primary">
              ₹ {Math.round((prop.price || 8500000) * 0.00868).toLocaleString('en-IN')} / mo
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
