import React, { useState } from 'react';
import { usePendingVerifications, useApproveVerification, useRejectVerification, useSubmitVerificationDoc } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Upload, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const UserVerification = () => {
  const { user } = useAuth();
  const [docUrl, setDocUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const submitDocMutation = useSubmitVerificationDoc();
  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();
  const { data: pendingData, isLoading } = usePendingVerifications();

  const handleSubmitDoc = async (e) => {
    e.preventDefault();
    try {
      await submitDocMutation.mutateAsync({ documentUrl: docUrl, documentType: 'RERA_OR_ID' });
      setStatusMsg('Document submitted for admin verification!');
    } catch (err) {
      setStatusMsg('Submission failed: ' + (err.message || 'Error'));
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveMutation.mutateAsync(userId);
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectMutation.mutateAsync({ userId, reason: 'Document unclear or unverified' });
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Identity & Role Verification</h1>
          <p className="text-sm text-muted-foreground">Submit RERA licenses, ID proofs, or manage verification queues.</p>
        </div>

        {/* Broker / Builder Document Submission Form */}
        {(user?.role === 'BROKER' || user?.role === 'BUILDER') && (
          <Card className="p-4 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>Submit Verification Document</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Brokers and Builders must submit valid proof for full publishing privileges.
              </CardDescription>
            </CardHeader>
            {statusMsg && <div className="p-2 text-xs bg-emerald-50 text-emerald-800 rounded">{statusMsg}</div>}
            <form onSubmit={handleSubmitDoc} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Document URL / License Ref</label>
                <Input
                  placeholder="https://minio.gharsetu.internal/docs/rera-license.pdf"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" disabled={submitDocMutation.isPending}>
                Submit Document
              </Button>
            </form>
          </Card>
        )}

        {/* Admin Moderation Queue for Identity Service */}
        {user?.role === 'ADMIN' && (
          <Card className="space-y-4 p-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Pending Role Verifications (Identity Service)</span>
              </CardTitle>
            </CardHeader>

            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading pending verifications...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Requested Role</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(pendingData?.data || pendingData || []).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary">{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.verificationDoc || 'Submitted'}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button size="xs" variant="outline" className="text-emerald-600" onClick={() => handleApprove(u.id)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="xs" variant="ghost" className="text-destructive" onClick={() => handleReject(u.id)}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
