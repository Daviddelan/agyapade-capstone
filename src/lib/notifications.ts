import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const createNotification = async (
  userId: string,
  type: 'status_change' | 'review_started' | 'system',
  title: string,
  message: string,
  documentId?: string,
  documentName?: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      documentId,
      documentName,
      createdAt: serverTimestamp(),
      read: false
    });

    // In a real application, you would also send an email here
    console.log('Notification created:', { userId, type, title, message });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const sendDocumentStatusNotification = async (
  userId: string,
  documentId: string,
  documentName: string,
  newStatus: string
) => {
  const title = 'Document Status Updated';
  const message = `Your document "${documentName}" has been ${newStatus}.`;
  
  await createNotification(
    userId,
    'status_change',
    title,
    message,
    documentId,
    documentName
  );
};

export const sendReviewStartedNotification = async (
  userId: string,
  documentId: string,
  documentName: string
) => {
  const title = 'Document Review Started';
  const message = `Your document "${documentName}" is now being reviewed.`;
  
  await createNotification(
    userId,
    'review_started',
    title,
    message,
    documentId,
    documentName
  );
};
