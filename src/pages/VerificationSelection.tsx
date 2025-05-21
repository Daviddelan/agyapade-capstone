import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { SignupProgress } from '../components/signup/SignupProgress';
import { ContactVerification } from '../components/signup/ContactVerification';
import { getUserData } from '../lib/firebase';

export default function VerificationSelection() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!userId) return;
      try {
        const userData = await getUserData(userId);
        setUserEmail(userData?.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserEmail();
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Invalid Verification Request</h1>
            <p className="text-gray-600 mt-2">
              Please start the registration process again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-golden-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            Please verify your email address to complete your registration
          </p>
        </div>

        <SignupProgress currentStep={5} totalSteps={5} />

        <ContactVerification
          userId={userId}
          userEmail={userEmail}
          onVerificationComplete={() => {
            console.log('Email verification completed');
          }}
        />
      </div>
    </div>
  );
}