import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCompareProperties } from '../hooks/useApi';
import { Layers, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PropertyCompareSelector } from '@/components/property/PropertyCompareSelector';
import { PropertyCompareMatrixTable } from '@/components/property/PropertyCompareMatrixTable';

export const PropertyCompare = () => {
  const [searchParams] = useSearchParams();
  const initialP1 = searchParams.get('p1') || searchParams.get('ids')?.split(',')[0];
  const initialT1 = searchParams.get('t1');

  const [selectedProps, setSelectedProps] = useState([
    { id: initialP1 || '', title: initialT1 || '', searchKey: initialT1 || '' },
    { id: '', title: '', searchKey: '' }
  ]);
  const [errorMessage, setErrorMessage] = useState('');

  const compareMutation = useCompareProperties();
  const [comparedData, setComparedData] = useState([]);

  const handleSearchKeyChange = (index, val) => {
    setErrorMessage('');
    const list = [...selectedProps];
    list[index] = { ...list[index], searchKey: val };
    setSelectedProps(list);
  };

  const handleSelectProperty = (index, item) => {
    setErrorMessage('');
    const list = [...selectedProps];
    list[index] = { id: item.id, title: item.title, searchKey: item.title, raw: item };
    setSelectedProps(list);
  };

  const handleAddInput = () => {
    setErrorMessage('');
    if (selectedProps.length < 4) {
      setSelectedProps([...selectedProps, { id: '', title: '', searchKey: '' }]);
    }
  };

  const handleRemoveInput = (index) => {
    setErrorMessage('');
    if (selectedProps.length > 1) {
      const list = selectedProps.filter((_, i) => i !== index);
      setSelectedProps(list);
    }
  };

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const validSelected = selectedProps.filter(s => s.id && s.title);

    if (validSelected.length < 2) {
      setErrorMessage('Please select at least 2 properties from the search suggestions dropdown to compare.');
      return;
    }

    const ids = validSelected.map((s) => s.id);

    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      setErrorMessage('Duplicate properties selected. Please choose distinct properties to compare.');
      return;
    }

    try {
      const res = await compareMutation.mutateAsync(ids);
      setComparedData(res?.data || res || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch comparison matrix from backend service.');
      setComparedData([]);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Property Comparison Matrix (S-03)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Side-by-side technical specification, RERA compliance, and financial comparison directly hydrated from the database.
          </p>
        </div>

        <Card className="p-6 rounded-2xl border-border shadow-xs">
          <form onSubmit={handleCompare} className="space-y-4">
            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedProps.map((item, idx) => (
                <PropertyCompareSelector
                  key={idx}
                  index={idx}
                  value={item.searchKey}
                  onChange={(val) => handleSearchKeyChange(idx, val)}
                  onSelectProperty={(selected) => handleSelectProperty(idx, selected)}
                  onRemove={() => handleRemoveInput(idx)}
                  canRemove={selectedProps.length > 1}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedProps.length < 4 ? (
                <Button type="button" variant="outline" size="sm" onClick={handleAddInput} className="rounded-xl text-xs">
                  <Plus className="w-4 h-4 mr-1" /> Add Another Property
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Maximum 4 properties reached</span>
              )}

              <Button
                type="submit"
                disabled={compareMutation.isPending}
                className="rounded-xl text-xs font-semibold h-10 px-6 gap-2"
              >
                {compareMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Hydrating Comparison...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Compare Properties</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        <PropertyCompareMatrixTable comparedData={comparedData} />
      </div>
    </div>
  );
};
