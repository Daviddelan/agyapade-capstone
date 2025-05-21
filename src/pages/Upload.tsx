import React from 'react';
import { DashboardLayout } from '../components/dashboard/Layout';
import { DocumentUpload } from '../components/dashboard/DocumentUpload';

export default function Upload() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Upload Document</h1>
        <DocumentUpload />
      </div>
    </DashboardLayout>
  );
}