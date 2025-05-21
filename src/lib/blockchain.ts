import { SHA256 } from 'crypto-js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

interface DocumentMetadata {
  name: string;
  type: string;
  userId: string;
  uploadDate: Date;
}

interface BlockchainVerification {
  docId: string;
  docHash: string;
  verifiedBy: string;
  timestamp: number;
  comments?: string;
  transactionId: string;
}

// Calculate document hash using content and metadata
export const calculateDocHash = (fileUrl: string, metadata: DocumentMetadata): string => {
  // Create a string combining file content and metadata
  const dataString = `${fileUrl}${JSON.stringify(metadata)}`;
  // Generate SHA256 hash
  return SHA256(dataString).toString();
};

// Submit document verification to blockchain
export const submitDocumentVerification = async (
  docId: string,
  docHash: string,
  verifiedBy: string,
  comments?: string
): Promise<BlockchainVerification> => {
  try {
    // Call blockchain API endpoint
    const response = await fetch('/api/verify-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        docId,
        docHash,
        verifiedBy,
        comments,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit verification to blockchain');
    }

    const verification: BlockchainVerification = await response.json();

    // Update Firestore with blockchain transaction ID
    await updateDoc(doc(db, 'documents', docId), {
      blockchainVerification: {
        transactionId: verification.transactionId,
        timestamp: verification.timestamp,
        verifiedBy: verification.verifiedBy,
        docHash: verification.docHash,
        comments: verification.comments,
      },
    });

    return verification;
  } catch (error) {
    console.error('Blockchain verification error:', error);
    throw error;
  }
};

// Get document verification status from blockchain
export const getVerificationStatus = async (docId: string): Promise<BlockchainVerification | null> => {
  try {
    const response = await fetch(`/api/document-status/${docId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch verification status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return null;
  }
};
