import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { storage, db } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../../hooks/use-toast';

const DOCUMENT_TYPES = [
  'Land Title',
  'Lease Agreement',
  'Deed',
  'Mortgage Document',
  'Property Assessment',
  'Other'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.size <= MAX_FILE_SIZE) {
      setFile(selectedFile);
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: selectedFile.name.split('.')[0]
        }));
      }
    } else {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
    }
  }, [formData.name, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      // Generate unique file name with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `collaterals/${user.uid}/${fileName}`);
      
      // Set custom metadata and content type
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId: user.uid,
          documentType: formData.type,
          uploadDate: new Date().toISOString()
        }
      };
      
      // Upload file with metadata
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const fileUrl = await getDownloadURL(snapshot.ref);
      
      // Create document record
      await addDoc(collection(db, 'documents'), {
        userId: user.uid,
        name: formData.name,
        type: formData.type,
        status: 'pending',
        uploadDate: serverTimestamp(),
        fileUrl,
        privateKey: uuidv4()
      });

      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        action: 'upload',
        details: `Uploaded document: ${formData.name}`,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Document Uploaded",
        description: "Your document has been submitted for verification",
      });

      // Reset form
      setFormData({ name: '', type: '' });
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Document Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-golden-500 
                     focus:ring-golden-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Document Type
          </label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-golden-500 
                     focus:ring-golden-500"
            required
          >
            <option value="">Select Type</option>
            {DOCUMENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <div
            {...getRootProps()}
            className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 
                      px-6 py-10 ${isDragActive ? 'border-golden-500 bg-golden-50' : ''}`}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-300" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <input {...getInputProps()} />
                <label className="relative cursor-pointer rounded-md bg-white font-semibold 
                                text-golden-600 focus-within:outline-none focus-within:ring-2 
                                focus-within:ring-golden-600 focus-within:ring-offset-2 
                                hover:text-golden-500"
                >
                  {file ? (
                    <span>{file.name}</span>
                  ) : (
                    <span>
                      Upload a file or drag and drop
                      <br />
                      PDF, JPG, or PNG (max 10MB)
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
          >
            <span className="text-sm text-gray-600">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent 
                   rounded-md shadow-sm text-sm font-medium text-white bg-golden-600 
                   hover:bg-golden-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-golden-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </button>
      </form>
    </div>
  );
}