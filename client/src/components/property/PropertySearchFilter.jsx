import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { formatIndianNumber, numberToWordsINR } from '../../utils/numberFormat';

export const PropertySearchFilter = ({ searchCity, setSearchCity, bhk, setBhk, priceRange, setPriceRange, onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const FilterForm = () => (
    <form
      onSubmit={(e) => {
        onSearch(e);
        setIsOpen(false);
      }}
      className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
    >
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">City / Locality</label>
        <Input
          type="text"
          placeholder="e.g. Noida, Delhi"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Bedrooms (BHK)</label>
        <NativeSelect value={bhk} onChange={(e) => setBhk(e.target.value)}>
          <option value="">All BHK Configurations</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </NativeSelect>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Max Budget (₹)</label>
        <Input
          type="text"
          placeholder="e.g. 1,00,00,000"
          value={formatIndianNumber(priceRange)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            if (!isNaN(raw)) setPriceRange(raw);
          }}
        />
        {priceRange > 0 && (
          <p className="text-[10px] text-primary font-mono font-medium">
            ({numberToWordsINR(priceRange)})
          </p>
        )}
      </div>

      <Button type="submit" className="w-full bg-accent text-accent-foreground font-semibold">
        <Search className="w-4 h-4 mr-2" /> Search Properties
      </Button>
    </form>
  );

  return (
    <>
      {/* Desktop / Tablet Filters (sm and above) */}
      <Card className="p-6 shadow-xs border-border hidden sm:block">
        <FilterForm />
      </Card>

      {/* Mobile Filters Trigger (below sm / < 640px) */}
      <div className="sm:hidden space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="flex-1"
          />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-6 rounded-t-3xl max-h-[85vh] overflow-y-auto">
              <SheetHeader className="p-0 mb-4 text-left">
                <SheetTitle className="text-xl font-heading font-bold">Filter Properties</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Refine property listings by location, configuration, and budget.
                </SheetDescription>
              </SheetHeader>
              <FilterForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

