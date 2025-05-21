import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: Date;
  fileUrl?: string;
  privateKey?: string;
  views?: number;
}

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'date') {
      return b.uploadDate.getTime() - a.uploadDate.getTime();
    }
    return a.name.localeCompare(b.name);
  });

  const verifiedDocs = sortedDocs.filter(doc => doc.status === 'verified');
  const pendingDocs = sortedDocs.filter(doc => doc.status === 'pending');
  const rejectedDocs = sortedDocs.filter(doc => doc.status === 'rejected');

  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-500"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-500"
          >
            <option value="all">All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="verified" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="verified">
            Verified ({verifiedDocs.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingDocs.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedDocs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verified" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verifiedDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rejectedDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}