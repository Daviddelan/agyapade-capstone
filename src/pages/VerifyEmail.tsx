import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { handleEmailVerificationLink, checkEmailVerificationStatus, sendEmailVerificationLink } from '../lib/firebase';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';

interface VerificationState {
  isLoading: boolean;
  isVerified: boolean;
  error: string | null;
  userId: string | null;
}

const VERIFICATION_CHECK_INTERVAL = 5000; // Check every 5 seconds

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<VerificationState>({
    isLoading: true,
    isVerified: false,
    error: null,
    userId: null
  });
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const oobCode = searchParams.get('oobCode');
        const mode = searchParams.get('mode');
        const userId = searchParams.get('userId');
        const continueUrl = searchParams.get('continueUrl');

        // If we have a continueUrl, extract userId from it
        if (continueUrl && !userId) {
          const continueUrlParams = new URLSearchParams(new URL(continueUrl).search);
          const continueUrlUserId = continueUrlParams.get('userId');
          if (continueUrlUserId) {
            setState(prev => ({ ...prev, userId: continueUrlUserId }));
          }
        } else if (userId) {
          setState(prev => ({ ...prev, userId }));
        }

        // Handle direct verification link
        if (oobCode && mode === 'verifyEmail' && (userId || continueUrl)) {
          const finalUserId = userId || new URLSearchParams(new URL(continueUrl!).search).get('userId');
          if (!finalUserId) {
            throw new Error('User ID is missing from verification link');
          }

          await handleEmailVerificationLink(oobCode, finalUserId);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isVerified: true,
            userId: finalUserId
          }));

          toast({
            title: "Email Verified Successfully! 🎉",
            description: "Your email has been verified. You can now proceed to login.",
            duration: 5000,
          });
          return;
        }

        // If no verification code but we have userId, check status
        if (!oobCode && state.userId) {
          const status = await checkEmailVerificationStatus(state.userId);
          if (status.verified) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              isVerified: true
            }));
            return;
          }
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please click the verification link in your email to verify your account.'
        }));
      } catch (err) {
        console.error('Verification error:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Verification failed. Please try again.'
        }));
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  // Set up periodic status checking if we have userId but not verified
  useEffect(() => {
    if (!state.userId || state.isVerified) return;

    const checkStatus = async () => {
      try {
        const status = await checkEmailVerificationStatus(state.userId!);
        if (status.verified) {
          setState(prev => ({
            ...prev,
            isVerified: true,
            error: null
          }));
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error checking verification status:', err);
        return false;
      }
    };

    const intervalId = setInterval(async () => {
      const verified = await checkStatus();
      if (verified) {
        clearInterval(intervalId);
      }
    }, VERIFICATION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [state.userId, state.isVerified]);

  const handleResendVerification = async () => {
    if (!state.userId) return;
    
    setIsResending(true);
    try {
      await sendEmailVerificationLink(state.userId);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send verification email",
        duration: 5000,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    navigate('/login?verified=true&method=email');
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-golden-500" />
          <h2 className="text-2xl font-semibold">Verifying your email...</h2>
          <p className="text-gray-600">Please wait while we process your verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {state.isVerified ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">Email Verified!</h2>
            <p className="text-gray-600">Your email has been successfully verified.</p>
            <button
              onClick={handleContinue}
              className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-golden-500 hover:bg-golden-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
              <h2 className="mt-4 text-2xl font-semibold">Verification Required</h2>
            </div>
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
            {state.userId && (
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-golden-500 hover:bg-golden-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}