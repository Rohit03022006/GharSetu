import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useUploadPropertyImage } from '../../hooks/useApi';
import { Button } from '@/components/ui/button';

export const ImageUploadPipeline = ({ propertyId, existingImages = [] }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const uploadImageMutation = useUploadPropertyImage();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      await uploadImageMutation.mutateAsync({ id: propertyId, formData });
      setStatusMsg('Image uploaded to MinIO storage successfully!');
      setSelectedFile(null);
    } catch (err) {
      setStatusMsg('Upload failed: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="space-y-4 p-4 bg-muted/40 rounded-xl border border-border">
      <div className="flex items-center space-x-2">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h4 className="text-xs font-bold font-heading">MinIO Storage Image Pipeline (FR-PROP-07)</h4>
      </div>

      {statusMsg && (
        <div className="p-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="flex items-center space-x-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:opacity-90"
        />
        <Button type="submit" size="xs" disabled={!selectedFile || uploadImageMutation.isPending}>
          <Upload className="w-3.5 h-3.5 mr-1" /> Upload
        </Button>
      </form>
    </div>
  );
};
