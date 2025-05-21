import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  AlertCircle,
  Lock,
  UserCircle,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  RotateCcw,
  History
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { doc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useRole } from '../../hooks/useRole';
import { sendDocumentStatusNotification, sendReviewStartedNotification } from '../../lib/notifications';
import { calculateDocHash, submitDocumentVerification } from '../../lib/blockchain';
import type { Document, DocumentStatus, DocumentReviewState } from '../../types/documents';

interface DocumentReviewProps {
  documents: Document[];
  type: DocumentStatus;
}

type SortOption = 'name' | 'date';
type SortDirection = 'asc' | 'desc';

interface ReviewerInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function DocumentReview({ documents, type }: DocumentReviewProps) {
  const { user } = useAuthStore();
  const { role } = useRole();
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [newStatus, setNewStatus] = useState<DocumentStatus>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [uploaderDetails, setUploaderDetails] = useState<Record<string, { name: string }>>({});
  const [reviewerDetails, setReviewerDetails] = useState<Record<string, ReviewerInfo>>({});
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchUploaderDetails = async () => {
      const details: Record<string, { name: string }> = {};
      
      for (const document of documents) {
        if (!uploaderDetails[document.userId]) {
          try {
            const userDocRef = doc(db, 'users', document.userId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              details[document.userId] = {
                name: `${userData.firstName} ${userData.lastName}`
              };
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        }
      }
      
      setUploaderDetails(prev => ({ ...prev, ...details }));
    };

    fetchUploaderDetails();
  }, [documents]);

  useEffect(() => {
    const fetchReviewerDetails = async () => {
      const reviewerIds = new Set<string>();
      
      documents.forEach(doc => {
        if (doc.reviewedBy) reviewerIds.add(doc.reviewedBy);
        if (doc.reviewState?.reviewerId) reviewerIds.add(doc.reviewState.reviewerId);
      });

      const details: Record<string, ReviewerInfo> = {};
      for (const reviewerId of reviewerIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', reviewerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            details[reviewerId] = {
              id: reviewerId,
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              role: userData.role
            };
          }
        } catch (error) {
          console.error('Error fetching reviewer details:', error);
        }
      }
      
      setReviewerDetails(details);
    };

    fetchReviewerDetails();
  }, [documents]);

  const filteredAndSortedDocs = React.useMemo(() => {
    let filtered = [...documents];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term) ||
        uploaderDetails[doc.userId]?.name.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc'
          ? a.uploadDate.getTime() - b.uploadDate.getTime()
          : b.uploadDate.getTime() - a.uploadDate.getTime();
      }
    });

    return filtered;
  }, [documents, searchTerm, sortBy, sortDirection, uploaderDetails]);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsReviewOpen(true);
  };

  const startReview = async () => {
    if (!selectedDoc || !user) return;
    
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'documents', selectedDoc.id);
      await updateDoc(docRef, {
        status: 'under_review',
        reviewState: {
          status: 'under_review',
          reviewerId: user.uid,
          reviewerName: user.displayName || user.email,
          reviewStartedAt: serverTimestamp(),
          lastUpdatedAt: serverTimestamp()
        }
      });

      // Send notification to document owner
      await sendReviewStartedNotification(
        selectedDoc.userId,
        selectedDoc.id,
        selectedDoc.name
      );

      toast({
        title: 'Review Started',
        description: 'You are now reviewing this document.',
      });

      setSelectedDoc({
        ...selectedDoc,
        status: 'under_review',
        reviewState: {
          status: 'under_review',
          reviewerId: user.uid,
          reviewerName: user.displayName || user.email,
        }
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start document review.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const releaseReview = async () => {
    if (!selectedDoc) return;
    
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'documents', selectedDoc.id);
      await updateDoc(docRef, {
        status: 'pending',
        reviewState: {
          status: 'pending',
          lastUpdatedAt: serverTimestamp()
        }
      });

      toast({
        title: 'Review Released',
        description: 'The document is now available for review by others.',
      });

      setIsReviewOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to release document review.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (
    docId: string,
    newStatus: DocumentStatus,
    reason?: string,
    reviewState?: Partial<DocumentReviewState>
  ) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'documents', docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      const documentData = docSnap.data();

      const updateData = {
        status: newStatus,
        reviewState: {
          status: newStatus,
          reviewerId: user.uid,
          reviewerName: user.displayName || user.email,
          lastUpdatedAt: serverTimestamp(),
          ...reviewState
        },
        reviewedBy: user.uid,
        reviewDate: serverTimestamp()
      };

      if (reason) {
        updateData.statusChangeReason = reason;
      }

      if (newStatus === 'rejected') {
        updateData.rejectionReason = reason;
      }

      // Update Firestore
      await updateDoc(docRef, updateData);

      // Create status change log
      await addDoc(collection(db, 'documentStatusLogs'), {
        documentId: docId,
        previousStatus: documentData.status,
        newStatus,
        reason,
        changedBy: user.uid,
        changedAt: serverTimestamp()
      });

      // Send notification to document owner
      await sendDocumentStatusNotification(
        documentData.userId,
        docId,
        documentData.name,
        newStatus
      );

      toast({
        title: 'Status Updated',
        description: `Document status has been changed to ${newStatus}`,
      });

      // Update local state
      setSelectedDoc(prev => prev?.id === docId ? {
        ...prev,
        ...updateData,
        reviewDate: new Date()
      } : prev);

      return true;
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document status. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleApprove = async () => {
    if (!selectedDoc || !user) return;
  
    try {
      // 1. Fetch the document file from the URL
      const fileResponse = await fetch(selectedDoc.fileUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch the document file');
      }
      const fileBlob = await fileResponse.blob();
  
      // 2. Calculate the document hash
      const docHash = calculateDocHash(selectedDoc.fileUrl, {
        name: selectedDoc.name,
        type: selectedDoc.type,
        userId: selectedDoc.userId,
        uploadDate: selectedDoc.uploadDate
      });
  
      // 3. Prepare FormData for uploading to blockchain server
      const formData = new FormData();
      formData.append('file', fileBlob, selectedDoc.name || 'uploaded.pdf');
      formData.append('docId', selectedDoc.id);
      formData.append('ownerId', selectedDoc.userId); // ✅ This is needed for blockchain
      formData.append('comments', 'Document verified and approved');
      formData.append('docHash', docHash); // optional: if your server needs it
  
      // 4. Upload the document to blockchain server
      const uploadResponse = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document');
      }
  
      // 5. After successful blockchain upload, update Firestore
      const success = await handleStatusUpdate(selectedDoc.id, 'verified', '', {
        blockchainVerification: {
          transactionId: 'success', // you can replace this with real tx ID if you want
          timestamp: Date.now(),
          verifiedBy: user.uid,
          docHash: docHash
        }
      });
  
      if (success) {
        setIsReviewOpen(false);
      }
    } catch (error) {
      console.error('Error approving document:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve document. Please try again.',
        variant: 'destructive',
      });
    }
  };
  

  const handleReject = async () => {
    if (!selectedDoc) return;
    
    const success = await handleStatusUpdate(selectedDoc.id, 'rejected', rejectionReason);
    
    if (success) {
      setIsRejectionOpen(false);
      setIsReviewOpen(false);
      setRejectionReason('');
    }
  };

  const handleStatusChange = async () => {
    if (!selectedDoc) return;
    
    const success = await handleStatusUpdate(selectedDoc.id, newStatus, statusChangeReason);
    
    if (success) {
      setIsStatusChangeOpen(false);
      setIsReviewOpen(false);
      setStatusChangeReason('');
    }
  };

  const getStatusIcon = (doc: Document) => {
    switch (doc.status) {
      case 'under_review':
        return <Lock className="h-5 w-5 text-blue-500" />;
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const isDocumentLocked = (doc: Document) => {
    return doc.status === 'under_review' && 
           doc.reviewState?.reviewerId && 
           doc.reviewState.reviewerId !== user?.uid;
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatReviewerInfo = (reviewerId?: string) => {
    if (!reviewerId) return 'Not reviewed';
    const reviewer = reviewerDetails[reviewerId];
    if (!reviewer) return 'Loading...';
    return `${reviewer.name} (${reviewer.role})`;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    try {
      const validDate = date instanceof Date ? date : new Date(date);
      if (isNaN(validDate.getTime())) {
        return 'Invalid Date';
      }
      return format(validDate, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const renderDocumentCard = (doc: Document) => (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow 
                ${isDocumentLocked(doc) ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !isDocumentLocked(doc) && handleDocumentClick(doc)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <div>
            <h3 className="font-medium text-gray-900">{doc.name}</h3>
            <p className="text-sm text-gray-500">{doc.type}</p>
          </div>
        </div>
        {getStatusIcon(doc)}
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center">
          <UserCircle className="h-4 w-4 mr-1" />
          Uploaded by: {uploaderDetails[doc.userId]?.name || 'Loading...'}
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {formatDate(doc.uploadDate)}
        </div>
        
        {doc.reviewedBy && (
          <div className="flex items-center text-gray-600">
            <History className="h-4 w-4 mr-1" />
            Reviewed by: {formatReviewerInfo(doc.reviewedBy)}
            {doc.reviewDate && (
              <span className="ml-1">
                on {formatDate(doc.reviewDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {doc.status === 'under_review' && doc.reviewState?.reviewerName && (
        <div className="flex items-center text-sm text-blue-600 mt-2">
          <UserCircle className="h-4 w-4 mr-1" />
          Under review by: {formatReviewerInfo(doc.reviewState.reviewerId)}
        </div>
      )}

      {doc.rejectionReason && (
        <div className="mt-2 text-sm text-red-600">
          Reason: {doc.rejectionReason}
        </div>
      )}

      {isDocumentLocked(doc) && (
        <div className="mt-2 text-sm text-gray-500 italic">
          This document is being reviewed by another user
        </div>
      )}
    </motion.div>
  );

  const renderReviewHistory = () => {
    if (!selectedDoc) return null;

    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-2">Review History</h3>
        <div className="space-y-2">
          {selectedDoc.reviewedBy && (
            <div className="text-sm">
              <span className="font-medium">Last Review: </span>
              {formatReviewerInfo(selectedDoc.reviewedBy)}
              {selectedDoc.reviewDate && (
                <span className="text-gray-500">
                  {' '}on {format(selectedDoc.reviewDate, 'PPP p')}
                </span>
              )}
            </div>
          )}
          {selectedDoc.status === 'rejected' && (
            <div className="text-sm text-red-600">
              <span className="font-medium">Rejection Reason: </span>
              {selectedDoc.rejectionReason}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by document name, type, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-40"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </Select>
            <button
              onClick={toggleSortDirection}
              className="p-2 border rounded hover:bg-gray-50"
              title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortDirection === 'asc' ? <SortAsc /> : <SortDesc />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedDocs.map(renderDocumentCard)}
      </div>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Review</DialogTitle>
            <DialogDescription>
              Review the document details and take appropriate action
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <iframe
                  src={selectedDoc.fileUrl}
                  className="w-full h-full rounded-lg"
                  title="Document Preview"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document Name</Label>
                  <p className="text-gray-900">{selectedDoc.name}</p>
                </div>
                <div>
                  <Label>Document Type</Label>
                  <p className="text-gray-900">{selectedDoc.type}</p>
                </div>
                <div>
                  <Label>Upload Date</Label>
                  <p className="text-gray-900">
                    {format(selectedDoc.uploadDate, 'PPP')}
                  </p>
                </div>
                <div>
                  <Label>Uploader</Label>
                  <p className="text-gray-900">
                    {uploaderDetails[selectedDoc.userId]?.name || 'Loading...'}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-gray-900 capitalize">{selectedDoc.status}</p>
                </div>
              </div>

              {selectedDoc.rejectionReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Rejection Reason: {selectedDoc.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}

              {renderReviewHistory()}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedDoc?.status === 'pending' && (
              <button
                onClick={startReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                Start Review
              </button>
            )}

            {selectedDoc?.status === 'under_review' && 
             selectedDoc.reviewState?.reviewerId === user?.uid && (
              <>
                <button
                  onClick={() => setIsRejectionOpen(true)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Approve
                </button>
                <button
                  onClick={releaseReview}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Release Review
                </button>
              </>
            )}

            {role === 'admin' && selectedDoc?.status !== 'under_review' && (
              <button
                onClick={() => {
                  setNewStatus(selectedDoc.status);
                  setIsStatusChangeOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                <RotateCcw className="h-4 w-4" />
                Change Status
              </button>
            )}
            
            <a
              href={selectedDoc?.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Full Document
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectionOpen} onOpenChange={setIsRejectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Input
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsRejectionOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
            >
              Confirm Rejection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusChangeOpen} onOpenChange={setIsStatusChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Document Status</DialogTitle>
            <DialogDescription>
              Please select the new status and provide a reason for the change
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="newStatus">New Status</Label>
              <Select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as DocumentStatus)}
                className="mt-1"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusChangeReason">Reason for Change</Label>
              <Input
                id="statusChangeReason"
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="Enter the reason for changing the status"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsStatusChangeOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              disabled={!statusChangeReason.trim() || isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
            >
              Confirm Change
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}