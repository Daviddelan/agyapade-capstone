import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  connectAuthEmulator,
  browserLocalPersistence,
  setPersistence,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  applyActionCode,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as sendPasswordResetEmailFirebase
} from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Rate limiting configuration
const EMAIL_RATE_LIMIT = 60000; // 60 seconds
const emailRateLimits = new Map<string, number>();

// Retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to implement retry logic
const withRetry = async <T>(
  operation: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (error?.code === 'auth/network-request-failed' || error?.name === 'FirebaseError') {
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError!;
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Set persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);

export { app, analytics, db, storage, auth };

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  return withRetry(async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // If user document doesn't exist, fetch data from individualRegistrations
        const registrationsQuery = query(
          collection(db, 'individualRegistrations'),
          where('firebaseUid', '==', userCredential.user.uid)
        );
        
        const registrationDocs = await getDocs(registrationsQuery);
        
        if (!registrationDocs.empty) {
          const registrationData = registrationDocs.docs[0].data();
          
          // Create user document with basic information and role
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            firstName: registrationData.firstName,
            lastName: registrationData.surname,
            title: registrationData.title,
            email: registrationData.email,
            role: registrationData.role || 'user', // Use role from registration if exists
            createdAt: registrationData.createdAt,
            lastLogin: serverTimestamp()
          });
        } else {
          // If no registration data found, create minimal user document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            role: 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
        }
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: serverTimestamp()
        });
      }

      // Get the latest user data including role
      const updatedUserDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = updatedUserDoc.data();
      
      console.log('User role from login:', userData?.role); // Debug log
      
      return {
        user: userCredential.user,
        role: userData?.role || 'user'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support for assistance.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later or reset your password.');
        default:
          throw new Error('An error occurred during login. Please try again.');
      }
    }
  });
};

export const sendLoginVerificationCode = async (email: string) => {
  return withRetry(async () => {
    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in Firestore with expiration
      const verificationRef = collection(db, 'loginVerifications');
      await addDoc(verificationRef, {
        email,
        code,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
        used: false
      });

      // In a real application, you would send this code via email
      // For development, we'll console.log it
      console.log('Verification code:', code);
      
      return code;
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new Error('Failed to send verification code. Please try again.');
    }
  });
};

export const verifyLoginCode = async (email: string, code: string) => {
  return withRetry(async () => {
    try {
      // Query for valid verification codes
      const verificationRef = collection(db, 'loginVerifications');
      const q = query(
        verificationRef,
        where('email', '==', email),
        where('code', '==', code),
        where('used', '==', false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Invalid or expired verification code');
      }

      const verification = snapshot.docs[0];
      const verificationData = verification.data();

      // Check if code is expired
      if (verificationData.expiresAt.toDate() < new Date()) {
        throw new Error('Verification code has expired. Please request a new code.');
      }

      // Mark code as used
      await updateDoc(doc(verificationRef, verification.id), {
        used: true,
        usedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to verify code. Please try again.');
    }
  });
};

export const sendEmailVerificationLink = async (userId: string) => {
  return withRetry(async () => {
    try {
      // Check rate limit
      const lastSentTime = emailRateLimits.get(userId);
      if (lastSentTime) {
        const timeSinceLastEmail = Date.now() - lastSentTime;
        if (timeSinceLastEmail < EMAIL_RATE_LIMIT) {
          const remainingTime = Math.ceil((EMAIL_RATE_LIMIT - timeSinceLastEmail) / 1000);
          throw new Error(`Please wait ${remainingTime} seconds before requesting another verification email.`);
        }
      }

      // Send verification email
      if (auth.currentUser) {
        const actionCodeSettings = {
          url: `${window.location.origin}/verify-email?userId=${userId}`,
          handleCodeInApp: true // Set to true to handle verification in the app
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        emailRateLimits.set(userId, Date.now());

        // Update the user's verification status in Firestore
        const userRef = doc(db, 'individualRegistrations', userId);
        await setDoc(userRef, {
          verificationStatus: {
            emailVerificationSent: true,
            emailVerificationSentAt: serverTimestamp()
          }
        }, { merge: true });

      } else {
        throw new Error('No authenticated user found');
      }
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      if (error?.code === 'auth/too-many-requests') {
        throw new Error('Too many verification attempts. Please try again in a few minutes.');
      }
      throw error;
    }
  });
};

export const handleEmailVerificationLink = async (actionCode: string, userId: string): Promise<void> => {
  return withRetry(async () => {
    try {
      // Apply the action code
      await applyActionCode(auth, actionCode);

      // Update verification status in Firestore
      const userRef = doc(db, 'individualRegistrations', userId);
      await setDoc(userRef, {
        verificationStatus: {
          email: true,
          emailVerifiedAt: serverTimestamp()
        }
      }, { merge: true });

    } catch (error: any) {
      console.error('Error handling email verification:', error);
      if (error.code === 'auth/invalid-action-code') {
        throw new Error('This verification link has expired or already been used. Please request a new one.');
      }
      throw new Error('Failed to verify email. Please try again.');
    }
  });
};

export const checkEmailVerificationStatus = async (userId: string) => {
  return withRetry(async () => {
    try {
      // First check Firebase Auth status
      if (auth.currentUser) {
        // Force refresh the token to get the latest email verification status
        await auth.currentUser.reload();
        
        if (auth.currentUser.emailVerified) {
          // Update Firestore status
          const userRef = doc(db, 'individualRegistrations', userId);
          await setDoc(userRef, {
            verificationStatus: {
              email: true,
              emailVerifiedAt: serverTimestamp()
            }
          }, { merge: true });
          
          return {
            verified: true,
            verifiedAt: new Date()
          };
        }
      }

      // If not verified in Firebase Auth, check Firestore as fallback
      const userDoc = await getDoc(doc(db, 'individualRegistrations', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      return {
        verified: userData.verificationStatus?.email === true,
        verifiedAt: userData.verificationStatus?.emailVerifiedAt?.toDate()
      };
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw new Error('Failed to check verification status');
    }
  });
};

export const updateVerificationStatus = async (userId: string, type: 'email' | 'phone'): Promise<void> => {
  return withRetry(async () => {
    try {
      const userRef = doc(db, 'individualRegistrations', userId);
      await setDoc(userRef, {
        verificationStatus: {
          [type]: true,
          [`${type}VerifiedAt`]: serverTimestamp()
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  });
};

// Clean up existing reCAPTCHA instances
const cleanupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  // Remove any existing reCAPTCHA iframes
  const recaptchaElements = document.querySelectorAll('.grecaptcha-badge');
  recaptchaElements.forEach(element => element.remove());
};

export const trackAccountTypeSelection = (accountType: string) => {
  try {
    logEvent(analytics, 'account_type_selected', {
      account_type: accountType,
      timestamp: new Date().toISOString()
    });
    console.log('Account type selection tracked:', accountType);
  } catch (error) {
    console.error('Error tracking account type selection:', error);
  }
};

export const createTempRegistration = async (accountType: string, ipAddress: string) => {
  console.log('Creating temporary registration:', { accountType, ipAddress });
  
  if (!accountType || !ipAddress) {
    throw new Error('Account type and IP address are required');
  }

  const sessionId = uuidv4();
  
  return withRetry(async () => {
    try {
      const tempRegistrationsRef = collection(db, 'tempRegistrations');
      await addDoc(tempRegistrationsRef, {
        sessionId,
        accountType,
        ipAddress,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });
      
      console.log('Temporary registration created with session ID:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error creating temporary registration:', error);
      throw new Error('Failed to create temporary registration. Please check your connection and try again.');
    }
  });
};

export const uploadIdentificationDocument = async (file: File, userId: string): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  return withRetry(async () => {
    try {
      console.log(`Starting upload for identification document: ${file.name}`);
      
      const timestamp = Date.now();
      const fileRef = ref(storage, `identification/${userId}/${timestamp}_${file.name}`);
      
      console.log('Uploading file to Firebase Storage...');
      const snapshot = await uploadBytes(fileRef, file);
      console.log('File uploaded successfully. Getting download URL...');
      
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained successfully');
      
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading identification document:', error);
      throw new Error('Failed to upload identification document. Please try again.');
    }
  });
};

export const uploadAdditionalDocuments = async (files: File[], userId: string): Promise<string[]> => {
  if (!files.length) return [];

  return withRetry(async () => {
    try {
      console.log(`Starting upload for ${files.length} additional documents`);
      
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const fileRef = ref(storage, `additional-documents/${userId}/${timestamp}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        return getDownloadURL(snapshot.ref);
      });

      const urls = await Promise.all(uploadPromises);
      console.log('All additional documents uploaded successfully');
      return urls;
    } catch (error) {
      console.error('Error uploading additional documents:', error);
      throw new Error('Failed to upload additional documents. Please try again.');
    }
  });
};

export const submitIndividualRegistration = async (formData: any, sessionId: string): Promise<string> => {
  console.log('Starting individual registration submission');
  
  return withRetry(async () => {
    try {
      // Check if email is already in use
      const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email);
      if (signInMethods.length > 0) {
        throw new Error('This email address is already registered. Please use a different email or sign in to your existing account.');
      }

      const userId = uuidv4();
      console.log(`Generated userId: ${userId}`);

      // Create Firebase Auth user with retry logic
      let userCredential;
      try {
        console.log('Creating Firebase Auth user...');
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      } catch (error: any) {
        if (error.code === 'auth/network-request-failed') {
          throw new Error('Network connection error. Please check your internet connection and try again.');
        }
        throw error;
      }

      const firebaseUser = userCredential.user;

      // Hash password before storing
      console.log('Hashing password...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(formData.password, salt);

      // Upload identification document
      let idDocumentUrl = '';
      if (formData.identificationDocument) {
        console.log('Uploading identification document');
        idDocumentUrl = await uploadIdentificationDocument(
          formData.identificationDocument,
          userId
        );
      }

      // Upload additional documents if any
      let additionalDocumentUrls: string[] = [];
      if (formData.additionalDocuments?.length > 0) {
        console.log('Uploading additional documents');
        additionalDocumentUrls = await uploadAdditionalDocuments(
          formData.additionalDocuments,
          userId
        );
      }

      // Prepare registration data
      const registrationData = {
        userId,
        firebaseUid: firebaseUser.uid,
        sessionId,
        ...formData,
        password: hashedPassword,
        salt,
        identificationDocumentUrl: idDocumentUrl,
        additionalDocumentUrls,
        createdAt: serverTimestamp(),
        status: 'pending_verification',
        verificationStatus: {
          email: false,
          phone: false
        }
      };

      // Remove sensitive data before storing
      delete registrationData.identificationDocument;
      delete registrationData.additionalDocuments;
      delete registrationData.confirmPassword;

      // Store in Firestore with retry logic
      try {
        console.log('Storing registration data in Firestore');
        await setDoc(doc(db, 'individualRegistrations', userId), registrationData);
        
        // Create user profile
        await createUserProfile(firebaseUser.uid, {
          firstName: formData.firstName,
          lastName: formData.surname,
          title: formData.title,
          email: formData.email
        });
      } catch (error) {
        // If Firestore storage fails, clean up the created auth user
        await firebaseUser.delete();
        throw new Error('Failed to store registration data. Please try again.');
      }

      console.log('Individual registration completed successfully');
      return userId;
    } catch (error) {
      console.error('Error in registration process:', error);
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed. Please try again.');
    }
  });
};

export const createUserProfile = async (userId: string, userData: any) => {
  return withRetry(async () => {
    try {
      // Create user profile document with default role
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        role: 'user', // Set default role
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  });
};

export const sendVerificationCode = async (userId: string, recaptchaContainerId: string): Promise<any> => {
  return withRetry(async () => {
    try {
      console.log('Setting up phone verification...');
      
      // Clean up any existing reCAPTCHA instances
      cleanupRecaptcha();
      
      // Get the user's phone number from Firestore
      const userDoc = await getDoc(doc(db, 'individualRegistrations', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const phoneNumber = userData.primaryPhone;

      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }

      // Format the phone number for Ghana (if not already formatted)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+233${phoneNumber.replace(/^0+/, '')}`;

      // Initialize ReCaptcha verifier with invisible size
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          cleanupRecaptcha();
          throw new Error('reCAPTCHA verification expired. Please try again.');
        }
      });

      // Render the reCAPTCHA widget
      await window.recaptchaVerifier.render();

      // Send verification code
      console.log('Sending verification code to:', formattedPhone);
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      return { verificationId: confirmationResult.verificationId };
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      cleanupRecaptcha();
      
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please enter a valid Ghanaian phone number.');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('Too many verification attempts. Please try again later.');
      } else if (error.code === 'auth/captcha-check-failed') {
        throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
      }
      throw new Error('Failed to send verification code. Please try again.');
    }
  });
};

export const verifyPhoneCode = async (verificationId: string, code: string): Promise<void> => {
  return withRetry(async () => {
    try {
      console.log('Verifying code:', { verificationId });
      
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await auth.currentUser?.linkWithCredential(credential);
      
      console.log('Phone number verified successfully');
      
      // Clean up reCAPTCHA after successful verification
      cleanupRecaptcha();
    } catch (error: any) {
      console.error('Error verifying code:', error);
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid verification code. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('Verification code has expired. Please request a new code.');
      }
      throw new Error('Failed to verify code. Please try again.');
    }
  });
};

export const getUserData = async (userId: string) => {
  return withRetry(async () => {
    try {
      const userDoc = await getDoc(doc(db, 'individualRegistrations', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return userDoc.data();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to fetch user information');
    }
  });
};

export const updateUserInformation = async (userId: string, updatedData: any) => {
  return withRetry(async () => {
    try {
      const userRef = doc(db, 'individualRegistrations', userId);
      
      // Remove email and phone from updates as they can't be modified
      const { email, primaryPhone, ...updateData } = updatedData;
      
      await setDoc(userRef, updateData, { merge: true });
      console.log('User information updated successfully');
    } catch (error) {
      console.error('Error updating user information:', error);
      throw new Error('Failed to update user information');
    }
  });
};

export const finalizeRegistration = async (userId: string, signature: string) => {
  return withRetry(async () => {
    try {
      const userRef = doc(db, 'individualRegistrations', userId);
      await setDoc(userRef, {
        status: 'active',
        termsAccepted: true,
        termsSignature: signature,
        termsAcceptedAt: serverTimestamp()
      }, { merge: true });
      console.log('Registration finalized successfully');
    } catch (error) {
      console.error('Error finalizing registration:', error);
      throw new Error('Failed to complete registration');
    }
  });
};

export const deleteRegistration = async (userId: string) => {
  return withRetry(async () => {
    try {
      // Get user data to check for files to delete
      const userDoc = await getDoc(doc(db, 'individualRegistrations', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Delete uploaded files if they exist
      if (userData.identificationDocumentUrl) {
        const fileRef = ref(storage, userData.identificationDocumentUrl);
        await deleteObject(fileRef);
      }

      if (userData.additionalDocumentUrls?.length) {
        await Promise.all(
          userData.additionalDocumentUrls.map(async (url: string) => {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
          })
        );
      }

      // Delete the user's auth account
      if (userData.firebaseUid) {
        await auth.currentUser?.delete();
      }

      // Delete the user document
      await deleteDoc(doc(db, 'individualRegistrations', userId));
      
      console.log('Registration deleted successfully');
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw new Error('Failed to delete registration');
    }
  });
};

export const sendPasswordResetEmail = async (email: string) => {
  return withRetry(async () => {
    try {
      await sendPasswordResetEmailFirebase(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      }
      throw error;
    }
  });
};

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}