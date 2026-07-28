import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { useShareMetadata } from '../../hooks/useApi';
import { Button } from '@/components/ui/button';

export const PropertyShareModal = ({ propertyId, title }) => {
  const [copied, setCopied] = useState(false);
  const { data } = useShareMetadata(propertyId);
  const shareData = data?.data || {
    shareUrl: window.location.href,
    title: title || 'GharSetu Verified Property',
    description: 'Check out this verified property listing on GharSetu.'
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareData.shareUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold font-heading flex items-center space-x-1.5">
          <Share2 className="w-4 h-4 text-primary" />
          <span>Share Listing</span>
        </h4>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">OG Metadata Active</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {shareData.description}
      </p>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          readOnly
          value={shareData.shareUrl || window.location.href}
          className="flex-1 bg-background text-xs p-2 rounded border border-border text-muted-foreground truncate"
        />
        <Button size="xs" variant={copied ? "default" : "outline"} onClick={handleCopyLink}>
          {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};
