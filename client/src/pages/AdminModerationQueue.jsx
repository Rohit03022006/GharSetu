import React, { useState } from 'react';
import { FileCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const AdminModerationQueue = () => {
  const [items, setItems] = useState([
    { id: 'mod-1', propertyTitle: '3 BHK Sector 62', builder: 'Meera (Builder)', submittedAt: '2 hours ago', flag: 'DUPLICATE_FLAGGED' },
    { id: 'mod-2', propertyTitle: '2 BHK Luxury Rohini', builder: 'Arjun (Broker)', submittedAt: '5 hours ago', flag: 'NORMAL' }
  ]);

  const handleApprove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleReject = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Admin Moderation Queue (S-19)</h1>
          <p className="text-sm text-muted-foreground">Review submitted properties with risk-flagging triaging (Rakesh Admin Persona requirement).</p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="font-heading font-semibold text-sm">
              Pending Approval Queue ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Flag</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                      Nothing pending review
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.flag === 'DUPLICATE_FLAGGED' ? (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 p-1.5" title="Potential Duplicate Flagged">
                            <AlertTriangle className="w-4 h-4" />
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 p-1.5">
                            <FileCheck className="w-4 h-4" />
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">{item.propertyTitle}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.builder} • {item.submittedAt}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(item.id)}
                          className="text-xs h-8"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
