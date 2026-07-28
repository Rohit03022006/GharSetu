import React, { useState } from 'react';
import { usePropertyAutocomplete } from '../../hooks/useApi';
import { Search, Building2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const PropertyCompareSelector = ({ value, onChange, onSelectProperty, onRemove, canRemove, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = usePropertyAutocomplete(value);

  const rawListings = data?.data || data || [];
  const suggestions = Array.isArray(rawListings) ? rawListings : [];

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            placeholder={`Type & select property name #${index + 1}...`}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-8"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-2.5 top-3" />
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 shrink-0"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && value.length >= 1 && suggestions.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-2.5 text-xs hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between border-b border-border/40 last:border-0"
              onClick={() => {
                onSelectProperty(item);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold truncate">{item.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 ml-2">
                {item.city}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
