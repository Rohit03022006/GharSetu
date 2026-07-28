import React, { useState } from 'react';
import { User, Phone, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const BrokerLeadsKanban = () => {
  const [leads, setLeads] = useState([
    { id: 'lead-1', name: 'Ananya Roy', stage: 'NEW', phone: '+91 9811223344', property: '3 BHK Sector 62' },
    { id: 'lead-2', name: 'Vikram Seth', stage: 'SITE_VISIT', phone: '+91 9822334455', property: '2 BHK Rohini' },
    { id: 'lead-3', name: 'Sanjay Dutt', stage: 'NEGOTIATION', phone: '+91 9833445566', property: 'Penthouse Bandra' }
  ]);

  const stages = [
    { key: 'NEW', label: 'New Lead' },
    { key: 'SITE_VISIT', label: 'Site Visit Scheduled' },
    { key: 'NEGOTIATION', label: 'Negotiation' },
    { key: 'BOOKED', label: 'Closed / Booked' }
  ];

  const moveStage = (leadId, newStage) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Leads Kanban Board (S-14)</h1>
          <p className="text-sm text-muted-foreground">Manage buyer lead stages in under 10 seconds (Arjun Broker Persona requirement).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            return (
              <Card key={stage.key} className="p-4 space-y-4">
                <CardHeader className="p-0 pb-3 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="font-heading font-semibold text-sm">{stage.label}</CardTitle>
                  <Badge variant="secondary" className="rounded-full">
                    {stageLeads.length}
                  </Badge>
                </CardHeader>

                <CardContent className="p-0 space-y-3">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="p-3 bg-muted/30 border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center text-foreground">
                          <User className="w-3.5 h-3.5 mr-1 text-primary" />
                          {lead.name}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{lead.property}</p>
                      <p className="text-muted-foreground flex items-center">
                        <Phone className="w-3 h-3 mr-1" /> {lead.phone}
                      </p>

                      <div className="pt-2 border-t border-border flex justify-end">
                        {stage.key !== 'BOOKED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStage(lead.id, stages[stages.findIndex((s) => s.key === stage.key) + 1].key)}
                            className="text-[10px] h-6 px-2 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            Advance Stage <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
