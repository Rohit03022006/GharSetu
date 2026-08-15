import React, { useState } from 'react';
import { User, Phone, ArrowRight, Clock, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads, useUpdateLeadStage } from '../hooks/useApi';

export const BrokerLeadsKanban = () => {
  const { data, isLoading, error, refetch } = useLeads();
  const updateStageMutation = useUpdateLeadStage();
  const [transitionError, setTransitionError] = useState('');

  const rawLeads = data?.data || data || [];
  const leads = Array.isArray(rawLeads) ? rawLeads : [];

  const stages = [
    { key: 'NEW', label: 'New Lead', next: 'CONTACTED' },
    { key: 'CONTACTED', label: 'Contacted', next: 'VISIT_SCHEDULED' },
    { key: 'VISIT_SCHEDULED', label: 'Visit Scheduled', next: 'VISIT_COMPLETED' },
    { key: 'VISIT_COMPLETED', label: 'Visit Completed', next: 'NEGOTIATING' },
    { key: 'NEGOTIATING', label: 'Negotiation', next: 'CLOSED_WON' },
    { key: 'CLOSED_WON', label: 'Closed / Won', next: null }
  ];

  const handleAdvanceStage = async (leadId, nextStage) => {
    if (!nextStage) return;
    setTransitionError('');
    try {
      await updateStageMutation.mutateAsync({
        leadId,
        stage: nextStage,
        notes: `Advanced to ${nextStage} via Broker Kanban Portal`
      });
    } catch (err) {
      setTransitionError(err.message || 'Failed to update lead stage');
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Leads & Inquiries Pipeline (S-14)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Sequential lead stage pipeline powered by real-time engagement service events.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Leads</span>
          </Button>
        </div>

        {transitionError && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{transitionError}</span>
            </div>
            <button onClick={() => setTransitionError('')} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {error && (
          <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-center text-xs">
            {error.message || 'Failed to load leads from Engagement Service'}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Skeleton key={idx} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stages.map((stage) => {
              const stageLeads = leads.filter((l) => (l.currentStage || l.stage) === stage.key);

              return (
                <Card key={stage.key} className="p-3.5 rounded-2xl border-border shadow-xs flex flex-col justify-between bg-card/60">
                  <div className="space-y-3">
                    <CardHeader className="p-0 pb-2.5 border-b border-border flex flex-row items-center justify-between">
                      <CardTitle className="font-heading font-bold text-xs text-foreground truncate">
                        {stage.label}
                      </CardTitle>
                      <Badge variant="secondary" className="rounded-full text-[10px] px-2 font-mono font-bold">
                        {stageLeads.length}
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-0 space-y-2.5">
                      {stageLeads.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-border/60 rounded-xl text-[11px] text-muted-foreground/60">
                          No leads in {stage.label}
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <Card key={lead.id} className="p-3 bg-muted/40 border-border/80 rounded-xl space-y-2 text-xs shadow-none">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center text-foreground font-bold truncate">
                                <User className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
                                {lead.buyer?.name || lead.name || 'Verified Buyer'}
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground truncate">
                              Property: {lead.property?.title || `#${lead.propertyId}`}
                            </p>

                            {lead.buyer?.phone && (
                              <p className="text-[11px] text-muted-foreground flex items-center">
                                <Phone className="w-3 h-3 mr-1 text-primary" /> {lead.buyer.phone}
                              </p>
                            )}

                            <div className="text-[10px] text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                              {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString('en-IN') : 'Recent'}
                            </div>

                            {stage.next && (
                              <div className="pt-2 border-t border-border/60 flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={updateStageMutation.isPending}
                                  onClick={() => handleAdvanceStage(lead.id, stage.next)}
                                  className="text-[10px] h-6 px-2 text-primary hover:bg-primary/10 font-semibold rounded-lg"
                                >
                                  Advance <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
