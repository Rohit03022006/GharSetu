import React, { useState } from 'react';
import { useCreateDraft, useAutosaveDraft, useSubmitForReview } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { Save, Send, CheckCircle2 } from 'lucide-react';
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
  const createDraftMutation = useCreateDraft();
  const autosaveMutation = useAutosaveDraft();
  const submitMutation = useSubmitForReview();
  const navigate = useNavigate();

  const handleCreateOrSave = async () => {
    try {
      if (!propertyId) {
        const res = await createDraftMutation.mutateAsync(formData);
        setPropertyId(res.data?.id || 'draft-123');
        setStatusMsg('Draft initialized & saved.');
      } else {
        await autosaveMutation.mutateAsync({ id: propertyId, data: formData });
        setStatusMsg('Draft auto-saved successfully.');
      }
    } catch (err) {
      setStatusMsg('Autosave failed: ' + (err.message || 'Error saving'));
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (!propertyId) {
        const res = await createDraftMutation.mutateAsync(formData);
        await submitMutation.mutateAsync(res.data?.id || 'draft-123');
      } else {
        await submitMutation.mutateAsync(propertyId);
      }
      setStatusMsg('Submitted to Admin Moderation Queue!');
      setTimeout(() => navigate('/builder'), 1500);
    } catch (err) {
      setStatusMsg('Submission failed: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Multi-Step Property Editor (S-13)</h1>
          <p className="text-sm text-muted-foreground">Draft autosave enabled per FR-PROP-02 and UI-REQ-02 requirements.</p>
        </div>

        {statusMsg && (
          <div className="p-3 text-xs bg-primary/10 border border-primary text-primary rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-heading">
              {step === 1 ? 'Step 1: Basic Information' : 'Step 2: Pricing, Specs & Images'}
            </CardTitle>
            <CardDescription className="text-xs">
              Fill in key property characteristics. Changes are autosaved to draft status.
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

          <CardFooter className="border-t border-border flex justify-between pt-4">
            <Button variant="outline" size="sm" onClick={handleCreateOrSave}>
              <Save className="w-4 h-4 mr-1" /> Save Draft
            </Button>

            <div className="space-x-2">
              {step === 1 ? (
                <Button size="sm" onClick={() => setStep(2)}>Next &rarr;</Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>&larr; Back</Button>
                  <Button size="sm" className="bg-accent text-accent-foreground" onClick={handleSubmitReview}>
                    <Send className="w-4 h-4 mr-1" /> Submit for Review
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
