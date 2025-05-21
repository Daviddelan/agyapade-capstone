import React, { useState } from 'react';
import { Loader2, ExternalLink, Download } from 'lucide-react';

interface DocumentViewerProps {
  url: string;
  type?: string;
  onError?: (error: Error) => void;
}

export function DocumentViewer({ url, type, onError }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    const error = new Error('Failed to load document');
    setError('Failed to load document preview');
    onError?.(error);
    setIsLoading(false);
  };

  return (
    <div className="relative border rounded-lg overflow-hidden bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-golden-500" />
        </div>
      )}

      {error ? (
        <div className="p-4 text-center text-gray-500">
          <p>{error}</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-golden-500 hover:text-golden-600"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in New Tab
            </a>
            <a
              href={url}
              download
              className="inline-flex items-center text-golden-500 hover:text-golden-600"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </div>
        </div>
      ) : (
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={url}
            className="absolute inset-0 w-full h-full"
            onLoad={handleLoad}
            onError={handleError}
            title="Document Preview"
          />
        </div>
      )}

      <div className="p-2 bg-white border-t flex justify-end space-x-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-golden-500 hover:text-golden-600"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Open in New Tab
        </a>
        <a
          href={url}
          download
          className="inline-flex items-center text-sm text-golden-500 hover:text-golden-600"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </a>
      </div>
    </div>
  );
}