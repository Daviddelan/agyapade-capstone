import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { sendEmailVerificationLink, checkEmailVerificationStatus, updateVerificationStatus } from '../../lib/firebase';
import { Alert, AlertDescription } from '../ui/alert';

interface ContactVerificationProps {
  userId: string;
  userEmail?: string;
  onVerificationComplete: () => void;
}

export function ContactVerification({ 
  userId,
  userEmail,
  onVerificationComplete 
}: ContactVerificationProps) {
  const navigate = useNavigate();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Check verification status periodically
  useEffect(() => {
    let intervalId: number;

    const checkStatus = async () => {
      if (!userId || isVerified) return;

      try {
        setIsCheckingStatus(true);
        const status = await checkEmailVerificationStatus(userId);
        
        if (status.verified) {
          setIsVerified(true);
          onVerificationComplete();
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // Check immediately and then every 10 seconds
    checkStatus();
    intervalId = setInterval(checkStatus, 10000);

    return () => clearInterval(intervalId);
  }, [userId, isVerified, onVerificationComplete]);

  // Handle resend countdown
  useEffect(() => {
    let countdownId: number;

    if (resendCountdown > 0) {
      countdownId = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }

    return () => clearInterval(countdownId);
  }, [resendCountdown]);

  const handleSendEmail = async () => {
    if (isLoading || resendDisabled) return;

    setIsLoading(true);
    setError('');

    try {
      await sendEmailVerificationLink(userId);
      setIsEmailSent(true);
      setResendDisabled(true);
      setResendCountdown(60); // 60 seconds cooldown
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    try {
      setIsCheckingStatus(true);
      const status = await checkEmailVerificationStatus(userId);
      
      if (status.verified) {
        await updateVerificationStatus(userId, 'email');
        navigate('/login?verified=true&method=email');
      } else {
        setError('Your email has not been verified yet. Please check your inbox and verify your email before continuing.');
      }
    } catch (err) {
      setError('Failed to check verification status. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Send verification email only once when component mounts
  useEffect(() => {
    const sendInitialEmail = async () => {
      if (!isEmailSent && !isVerified) {
        await handleSendEmail();
      }
    };
    
    // Check if verification email was already sent
    const checkEmailSent = async () => {
      try {
        const status = await checkEmailVerificationStatus(userId);
        if (status.emailVerificationSent) {
          setIsEmailSent(true);
        } else {
          sendInitialEmail();
        }
      } catch (err) {
        console.error('Error checking email sent status:', err);
        sendInitialEmail();
      }
    };

    checkEmailSent();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 mx-auto text-golden-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isVerified ? 'Email Verified!' : 'Email Verification'}
        </h2>
        <p className="text-gray-600">
          {userEmail && !isVerified && `A verification email has been sent to ${userEmail}`}
          {isVerified && 'Your email has been successfully verified!'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {isVerified ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
              <span className="text-lg font-medium">Verification successful!</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              {isCheckingStatus ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Checking verification status...</span>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Please check your inbox and click the verification link to complete your registration.
                  </p>
                  <button
                    onClick={handleSendEmail}
                    disabled={isLoading || resendDisabled}
                    className="text-golden-600 hover:text-golden-700 font-medium disabled:text-gray-400 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendDisabled 
                      ? `Resend available in ${resendCountdown}s`
                      : isLoading 
                        ? 'Sending...' 
                        : 'Resend verification email'
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleDone}
          disabled={isCheckingStatus}
          className="px-8 py-3 bg-golden-500 text-white rounded-lg font-medium 
                   hover:bg-golden-600 transition-colors disabled:bg-gray-300 
                   disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCheckingStatus ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking status...
            </>
          ) : (
            'Done'
          )}
        </button>
      </div>
    </div>
  );
}