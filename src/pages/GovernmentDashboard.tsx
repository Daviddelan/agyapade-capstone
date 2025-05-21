import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { DashboardLayout } from '../components/dashboard/Layout';
import { DocumentReview } from '../components/government/DocumentReview';
import { useRole } from '../hooks/useRole';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function GovernmentDashboard() {
  const { role, loading } = useRole();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docsQuery = query(
          collection(db, 'documents'),
          orderBy('uploadDate', 'desc')
        );
        
        const snapshot = await getDocs(docsQuery);
        const docs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            uploadDate: data.uploadDate?.toDate() || new Date(),
            reviewDate: data.reviewDate?.toDate() || null
          };
        });
        
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (role !== 'government') {
    return <Navigate to="/dashboard" replace />;
  }

  const pendingDocs = documents.filter(doc => doc.status === 'pending');
  const verifiedDocs = documents.filter(doc => doc.status === 'verified');
  const rejectedDocs = documents.filter(doc => doc.status === 'rejected');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Document Review Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{pendingDocs.length}</span> pending reviews
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="pending">
              Pending ({pendingDocs.length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({verifiedDocs.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedDocs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <DocumentReview documents={pendingDocs} type="pending" />
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <DocumentReview documents={verifiedDocs} type="verified" />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <DocumentReview documents={rejectedDocs} type="rejected" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}