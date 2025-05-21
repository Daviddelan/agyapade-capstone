export interface Document {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  uploadDate: Date;
  userId: string;
  fileUrl: string;
  reviewState?: DocumentReviewState;
  rejectionReason?: string;
  statusChangeReason?: string;
  reviewedBy?: string;
  reviewDate?: Date | null;
  blockchainVerification?: BlockchainVerification;
}