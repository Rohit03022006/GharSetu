import React, { useState } from 'react';
import { useCreateDraft, useAutosaveDraft, useSubmitForReview } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { Save, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ListingFormBasic } from '../components/listing/ListingFormBasic';
import { ListingFormSpecs } from '../components/listing/ListingFormSpecs';
import { ImageUploadPipeline } from '../components/property/ImageUploadPipeline';
import { DuplicateCheckBanner } from '../components/property/DuplicateCheckBanner';

export const PropertyEditor = () => {
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    listingType: 'SALE',
    propertyType: 'APARTMENT',
    price: '',
    city: '',
    locality: '',
    bhk: '3',
    carpetArea: '1200',
    description: ''
  });

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const createDraftMutation = useCreateDraft();
  const autosaveMutation = useAutosaveDraft();
  const submitMutation = useSubmitForReview();
  const navigate = useNavigate();

  const formatPayload = (data) => ({
    title: data.title || 'Untitled Property Draft',
    description: data.description || '',
    listingType: data.listingType || 'SALE',
    propertyType: data.propertyType || 'APARTMENT',
    constructionStatus: data.constructionStatus || 'READY_TO_MOVE',
    furnishingStatus: data.furnishingStatus || 'UNFURNISHED',
    price: Number(data.price) || 0,
    areaSqFt: Number(data.carpetArea || data.areaSqFt) || 500,
    bedrooms: Number(data.bhk || data.bedrooms) || 1,
    bathrooms: Number(data.bathrooms) || 1,
    parkingSlots: Number(data.parkingSlots) || 0,
    address: data.locality || data.address || 'Pending Address',
    city: data.city || 'Mumbai',
    state: data.state || 'Maharashtra',
    pincode: data.pincode || '400001',
    securityDeposit: data.securityDeposit ? Number(data.securityDeposit) : undefined,
    leaseDurationMonths: data.leaseDurationMonths ? Number(data.leaseDurationMonths) : undefined
  });

  const handleCreateOrSave = async () => {
    setStatusMsg('');
    setErrorMsg('');
    try {
      const payload = formatPayload(formData);
      if (!propertyId) {
        const res = await createDraftMutation.mutateAsync(payload);
        const newId = res?.data?.id || res?.id;
        if (!newId) throw new Error('Backend failed to return generated draft ID.');
        setPropertyId(newId);
        setStatusMsg('Draft initialized & persisted in Listing Service.');
      } else {
        await autosaveMutation.mutateAsync({ id: propertyId, data: payload });
        setStatusMsg('Draft auto-saved successfully.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save draft to backend.');
    }
  };

  const handleSubmitReview = async () => {
    setStatusMsg('');
    setErrorMsg('');
    try {
      let targetId = propertyId;
      const payload = formatPayload(formData);
      if (!targetId) {
        const res = await createDraftMutation.mutateAsync(payload);
        targetId = res?.data?.id || res?.id;
        if (!targetId) throw new Error('Failed to create draft prior to submission.');
        setPropertyId(targetId);
      }
      await submitMutation.mutateAsync(targetId);
      setStatusMsg('Property submitted to Admin Moderation Queue successfully!');
      setTimeout(() => navigate('/builder'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Submission to moderation queue failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Multi-Step Property Editor (S-13)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time draft autosave and validation pipeline connected to Listing Service.
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
            <button onClick={() => setStatusMsg('')} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading font-bold text-foreground">
                {step === 1 ? 'Step 1: Basic Information & Location' : 'Step 2: Pricing, Specifications & Media'}
              </CardTitle>
              {propertyId && (
                <span className="text-[11px] font-mono text-muted-foreground bg-background px-2.5 py-1 rounded-lg border border-border">
                  ID: {propertyId}
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {step === 1
                ? 'Specify property title, type, and geographic locality.'
                : 'Configure unit measurements, floor plan specs, and upload media assets.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {step === 1 ? (
              <ListingFormBasic formData={formData} setFormData={setFormData} />
            ) : (
              <>
                <ListingFormSpecs formData={formData} setFormData={setFormData} />
                <DuplicateCheckBanner formData={formData} />
                <ImageUploadPipeline propertyId={propertyId} />
              </>
            )}
          </CardContent>

          <CardFooter className="border-t border-border flex justify-between pt-4 bg-muted/10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateOrSave}
              disabled={createDraftMutation.isPending || autosaveMutation.isPending}
              className="rounded-xl text-xs font-semibold"
            >
              <Save className="w-4 h-4 mr-1" />
              {createDraftMutation.isPending || autosaveMutation.isPending ? 'Saving...' : 'Save Draft'}
            </Button>

            <div className="space-x-2">
              {step === 1 ? (
                <Button size="sm" onClick={() => setStep(2)} className="rounded-xl text-xs font-semibold px-4">
                  Next &rarr;
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="rounded-xl text-xs">
                    &larr; Back
                  </Button>
                  <Button
                    size="sm"
                    disabled={submitMutation.isPending}
                    onClick={handleSubmitReview}
                    className="rounded-xl text-xs font-semibold px-4 bg-primary text-primary-foreground gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}</span>
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
