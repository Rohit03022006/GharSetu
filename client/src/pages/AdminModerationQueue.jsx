import React, { useState } from 'react';
import { FileCheck, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, UserCheck, Search, RefreshCw, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAdminListingsQueue, useApproveProperty, useRejectProperty, usePendingVerifications, useApproveVerification, useRejectVerification } from '../hooks/useApi';

export const AdminModerationQueue = () => {
  const { data: queueData, isLoading: listingsLoading, error: listingsError, refetch: refetchListings } = useAdminListingsQueue();
  const { data: kycData, isLoading: kycLoading, error: kycError, refetch: refetchKyc } = usePendingVerifications();

  const approveMutation = useApproveProperty();
  const rejectMutation = useRejectProperty();
  const approveKycMutation = useApproveVerification();
  const rejectKycMutation = useRejectVerification();

  const [activeTab, setActiveTab] = useState('properties');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const rawListings = queueData?.data || queueData || [];
  const propertyItems = Array.isArray(rawListings) ? rawListings : [];

  const rawKyc = kycData?.data || kycData || [];
  const kycItems = Array.isArray(rawKyc) ? rawKyc : [];

  const handleApprove = async (id) => {
    try {
      await approveMutation.mutateAsync(id);
      setFeedbackMessage(`Property #${id} successfully approved & published to production.`);
      refetchListings();
    } catch (err) {
      setFeedbackMessage(`Failed to approve: ${err.message || 'Error'}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMutation.mutateAsync({ id, reason: rejectionReason || 'Failed quality or RERA compliance checks' });
      setFeedbackMessage(`Property #${id} rejected and notified to builder.`);
      setRejectingId(null);
      setRejectionReason('');
      refetchListings();
    } catch (err) {
      setFeedbackMessage(`Failed to reject: ${err.message || 'Error'}`);
    }
  };

  const handleApproveKyc = async (userId) => {
    try {
      await approveKycMutation.mutateAsync(userId);
      setFeedbackMessage(`User #${userId} identity/RERA verified successfully.`);
      refetchKyc();
    } catch (err) {
      setFeedbackMessage(`Failed to verify KYC: ${err.message || 'Error'}`);
    }
  };

  const handleRejectKyc = async (userId) => {
    try {
      await rejectKycMutation.mutateAsync({ userId, reason: 'Invalid or illegible KYC document.' });
      setFeedbackMessage(`User #${userId} KYC rejected.`);
      refetchKyc();
    } catch (err) {
      setFeedbackMessage(`Failed to reject KYC: ${err.message || 'Error'}`);
    }
  };

  const filteredProperties = propertyItems.filter((p) => {
    const term = searchTerm.toLowerCase();
    const title = (p.title || '').toLowerCase();
    const builder = (p.builder || p.owner?.name || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const rera = (p.reraId || '').toLowerCase();
    return title.includes(term) || builder.includes(term) || city.includes(term) || rera.includes(term);
  });

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Moderation & Compliance Queue (S-17)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Admin governance pipeline for real estate listings and broker/builder KYC verification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchListings();
                refetchKyc();
              }}
              className="rounded-xl text-xs gap-1.5 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </Button>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 text-xs">
              Platform Admin
            </Badge>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
            <span>{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage('')} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {(listingsError || kycError) && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
            {listingsError?.message || kycError?.message || 'Error communicating with backend microservice.'}
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl border-border shadow-xs space-y-1">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Pending Listings</div>
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {propertyItems.length}
            </div>
          </Card>
          <Card className="p-5 rounded-2xl border-border shadow-xs space-y-1">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Pending KYC Audits</div>
            <div className="text-2xl font-bold font-heading text-amber-600 dark:text-amber-400 tabular-nums">
              {kycItems.length}
            </div>
          </Card>
          <Card className="p-5 rounded-2xl border-border shadow-xs space-y-1">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Review Action SLA</div>
            <div className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
              &lt; 2 hrs
            </div>
          </Card>
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="properties" className="text-xs font-semibold rounded-lg flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Listings Queue ({propertyItems.length})</span>
              </TabsTrigger>
              <TabsTrigger value="kyc" className="text-xs font-semibold rounded-lg flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>KYC Identity Audits ({kycItems.length})</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === 'properties' && (
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter by title, builder, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs bg-muted/40 rounded-xl h-9"
                />
              </div>
            )}
          </div>

          <TabsContent value="properties">
            <Card className="overflow-hidden rounded-2xl border-border shadow-xs">
              <CardHeader className="p-4 border-b border-border bg-muted/20">
                <CardTitle className="font-heading font-semibold text-sm">
                  Submissions Requiring Action
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">Risk</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Builder / Locality</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Decision Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listingsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          Loading pending approval queue from database...
                        </TableCell>
                      </TableRow>
                    ) : filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          No pending property submissions in the queue.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProperties.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.flag === 'DUPLICATE_FLAGGED' ? (
                              <Badge variant="outline" className="border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-1.5" title="Potential Duplicate Listing">
                                <AlertTriangle className="w-4 h-4" />
                              </Badge>
                            ) : item.flag === 'HIGH_PRICE_OUTLIER' ? (
                              <Badge variant="outline" className="border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 p-1.5" title="High Price Outlier">
                                <AlertTriangle className="w-4 h-4" />
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-blue-300 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 p-1.5">
                                <FileCheck className="w-4 h-4" />
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-sm text-foreground">{item.title}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              RERA: {item.reraId || 'Pending'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div>{item.builder || item.owner?.name || 'Owner Listed'}</div>
                            <div>{item.city}</div>
                          </TableCell>
                          <TableCell className="font-bold text-xs text-primary">
                            ₹ {Number(item.price || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {rejectingId === item.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <Input
                                  type="text"
                                  placeholder="Rejection note..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="h-8 text-xs w-44 bg-background"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(item.id)}
                                  disabled={rejectMutation.isPending}
                                  className="h-8 text-xs font-semibold"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRejectingId(null)}
                                  className="h-8 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(item.id)}
                                  disabled={approveMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-xl font-semibold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setRejectingId(item.id)}
                                  className="text-xs h-8 rounded-xl font-semibold"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card className="overflow-hidden rounded-2xl border-border shadow-xs">
              <CardHeader className="p-4 border-b border-border bg-muted/20">
                <CardTitle className="font-heading font-semibold text-sm">
                  Pending Identity & Broker License Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User / Organization</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Requested Role</TableHead>
                      <TableHead>Verification Document</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          Loading pending identity verifications...
                        </TableCell>
                      </TableRow>
                    ) : kycItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          No pending KYC verifications in the queue.
                        </TableCell>
                      </TableRow>
                    ) : (
                      kycItems.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-semibold text-xs text-foreground">{u.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-xs">{u.verificationDoc || 'Document on File'}</span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              disabled={approveKycMutation.isPending}
                              onClick={() => handleApproveKyc(u.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 rounded-lg font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve KYC
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={rejectKycMutation.isPending}
                              onClick={() => handleRejectKyc(u.id)}
                              className="text-xs h-7 rounded-lg font-semibold"
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
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};
