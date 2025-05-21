import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Download, Copy, Eye, Clock, KeyRound } from 'lucide-react'; 
import { useToast } from '../../hooks/use-toast';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    type: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadDate: Date;
    fileUrl?: string;
    privateKey?: string;
    views?: number;
  };
}

export function DocumentCard({ document }: DocumentCardProps) {
  const { toast } = useToast();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const handleCopyKey = () => {
    if (document.privateKey) {
      navigator.clipboard.writeText(document.privateKey);
      toast({
        title: "Private Key Copied",
        description: "The private key has been copied to your clipboard"
      });
    }
  };

  const handleCopyDocId = () => {
    navigator.clipboard.writeText(document.id);
    toast({
      title: "Document ID Copied",
      description: "The Document ID has been copied to your clipboard"
    });
  };

  const handleDownload = async () => {
    if (document.fileUrl) {
      try {
        const response = await fetch(document.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Failed to download the document",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{document.name}</h3>
          <p className="text-sm text-gray-500">{document.type}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[document.status]}`}>
          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {format(document.uploadDate, 'MMM dd, yyyy')}
        </div>
        {document.views !== undefined && (
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {document.views} views
          </div>
        )}
        <div className="flex items-center">
          <KeyRound className="h-4 w-4 mr-1" />
          Doc ID: 
          <span className="ml-1 font-mono text-xs truncate max-w-[120px]">{document.id}</span>
          <button
            onClick={handleCopyDocId}
            className="ml-2 p-1 text-gray-600 hover:text-golden-600 transition-colors"
            title="Copy Document ID"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-golden-600 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          {document.privateKey && (
            <button
              onClick={handleCopyKey}
              className="p-2 text-gray-600 hover:text-golden-600 transition-colors"
              title="Copy Private Key"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
