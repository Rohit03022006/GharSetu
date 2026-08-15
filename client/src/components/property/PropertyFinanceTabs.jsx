import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calculator, FileText, Building2, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PropertyFinanceTabs = ({ prop }) => {
  const price = Number(prop.price || 8500000);
  const areaSqFt = Number(prop.areaSqFt || 1200);
  const isUnderConstruction = prop.constructionStatus === 'UNDER_CONSTRUCTION';

  // 1. EMI Estimate (20 years @ 8.5%)
  const annualRate = 0.085;
  const monthlyRate = annualRate / 12;
  const months = 240;
  const loanPrincipal = price * 0.8; // 80% loan
  const emi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );

  // 2. Stamp Duty & Registration (Default 6% + 1%)
  const stampDutyRate = 0.06;
  const regFeeRate = 0.01;
  const stampDutyAmount = Math.round(price * stampDutyRate);
  const registrationFee = Math.round(price * regFeeRate);
  const totalGovtCharges = stampDutyAmount + registrationFee;

  // 3. GST (5% if under construction, 0% if ready to move)
  const gstRate = isUnderConstruction ? 0.05 : 0;
  const gstAmount = Math.round(price * gstRate);

  // 4. Monthly Maintenance (e.g. ₹3.5/sqft)
  const monthlyMaintenance = Math.round(areaSqFt * 3.5);

  const amenities = Array.isArray(prop.amenities) && prop.amenities.length > 0
    ? prop.amenities
    : ['24/7 Security & CCTV', '100% Power Backup', 'Residents Club House', 'Swimming Pool', 'Equipped Gymnasium', 'Covered Reserved Parking', 'Children Play Area', 'High-Speed Elevators'];

  return (
    <Card className="p-6 rounded-2xl border-border shadow-xs">
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="details" className="rounded-lg text-xs font-semibold">Specifications</TabsTrigger>
          <TabsTrigger value="amenities" className="rounded-lg text-xs font-semibold">Amenities ({amenities.length})</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-lg text-xs font-semibold">Finance & Cost Breakdown</TabsTrigger>
        </TabsList>

        {/* Specifications Tab */}
        <TabsContent value="details" className="pt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50">
              <span className="text-muted-foreground block text-[11px] font-medium">Carpet Area</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{areaSqFt.toLocaleString('en-IN')} sq.ft</span>
            </div>
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50">
              <span className="text-muted-foreground block text-[11px] font-medium">Configuration</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{prop.bedrooms || 3} BHK ({prop.bathrooms || 2} Baths)</span>
            </div>
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50">
              <span className="text-muted-foreground block text-[11px] font-medium">Furnishing</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{prop.furnishingStatus || 'Semi-Furnished'}</span>
            </div>
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/50">
              <span className="text-muted-foreground block text-[11px] font-medium">Construction Status</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">{prop.constructionStatus || 'Ready to Move'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Property Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {prop.description || 'Premium residential property with ultra-modern architectural design, state-of-the-art infrastructure, high ceiling heights, expansive natural ventilation, and optimal urban connectivity.'}
            </p>
          </div>

          {prop.reraId && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>RERA Registration Number:</strong> {prop.reraId} (Verified Project)</span>
            </div>
          )}
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {amenities.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 p-3 bg-muted/30 border border-border/60 rounded-xl text-xs font-medium text-foreground"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="truncate">{typeof item === 'string' ? item : item.name || 'Amenity'}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Finance & All-Inclusive Cost Breakdown Tab */}
        <TabsContent value="finance" className="pt-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Monthly EMI Card */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Monthly EMI (80% Loan)
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">20 Yrs @ 8.5%</span>
              </div>
              <div className="text-2xl font-heading font-bold text-blue-700 dark:text-blue-400">
                ₹ {emi.toLocaleString('en-IN')} <span className="text-xs font-normal">/ mo</span>
              </div>
              <p className="text-[10px] text-blue-800/80 dark:text-blue-300">
                Principal: ₹ {(loanPrincipal / 100000).toFixed(1)} Lakhs | Down payment: ₹ {((price - loanPrincipal) / 100000).toFixed(1)} Lakhs
              </p>
            </div>

            {/* Govt Taxes & Registry */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Stamp Duty & Registry
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">~7% Total</span>
              </div>
              <div className="text-2xl font-heading font-bold text-amber-700 dark:text-amber-400">
                ₹ {totalGovtCharges.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300">
                Stamp Duty (6%): ₹ {stampDutyAmount.toLocaleString('en-IN')} + Reg (1%): ₹ {registrationFee.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Maintenance & GST */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Maintenance & GST
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Estimates</span>
              </div>
              <div className="text-2xl font-heading font-bold text-emerald-700 dark:text-emerald-400">
                ₹ {monthlyMaintenance.toLocaleString('en-IN')} <span className="text-xs font-normal">/ mo</span>
              </div>
              <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300">
                GST: ₹ {gstAmount.toLocaleString('en-IN')} ({gstRate * 100}% {isUnderConstruction ? 'Under Constr.' : 'Exempt for Ready'})
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/40 rounded-xl border border-border">
            <div className="text-xs text-muted-foreground">
              Want to adjust loan tenure, down payment, or evaluate rental affordability?
            </div>
            <Button asChild size="sm" variant="outline" className="gap-2 text-xs font-semibold rounded-xl">
              <Link to="/finance/emi">
                <span>Open Full Finance Suite</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
