import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';
import { loginWithEmailAndPassword, sendLoginVerificationCode, verifyLoginCode } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type LoginStep = 'credentials' | 'verification';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<LoginStep>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  React.useEffect(() => {
    const verified = searchParams.get('verified');
    const method = searchParams.get('method');
    
    if (verified === 'true') {
      toast({
        title: "Account Created Successfully! 🎉",
        description: `Your account has been verified via ${method}. Please log in to continue.`,
        duration: 6000,
      });
    }
  }, [searchParams, toast]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, role } = await loginWithEmailAndPassword(formData.email, formData.password);
      console.log('Login successful, role:', role); // Debug log
      setUserRole(role);
      
      // Send verification code
      await sendLoginVerificationCode(formData.email);
      setVerificationCodeSent(true);
      
      // Move to verification step
      setCurrentStep('verification');
      
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
        duration: 5000,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sendLoginVerificationCode(formData.email);
      setVerificationCodeSent(true);
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
        duration: 5000,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send the verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await verifyLoginCode(formData.email, formData.verificationCode);
      
      // Get user role after verification
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      const role = userData?.role || userRole || 'user';
      
      console.log('Verification successful, redirecting with role:', role); // Debug log
      
      toast({
        title: "Login Successful",
        description: "Welcome back! You've been logged in successfully.",
        duration: 3000,
      });

      // Redirect based on role
      switch (role) {
        case 'admin':
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
          break;
        case 'government':
          console.log('Redirecting to government dashboard');
          navigate('/government');
          break;
        default:
          console.log('Redirecting to regular dashboard');
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-golden-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            {currentStep === 'credentials' 
              ? 'Log in to your account to continue'
              : 'Enter the verification code sent to your email'
            }
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-sm text-golden-600 hover:text-golden-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-golden-500 text-white rounded-lg font-medium 
                         hover:bg-golden-600 transition-colors disabled:bg-gray-300 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Continue
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  className="mt-1"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.verificationCode.length !== 6}
                className="w-full py-3 px-4 bg-golden-500 text-white rounded-lg font-medium 
                         hover:bg-golden-600 transition-colors disabled:bg-gray-300 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-5 w-5" />
                    Verify & Login
                  </>
                )}
              </button>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-golden-600 hover:text-golden-700 font-medium text-sm"
                >
                  Send new code
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('credentials')}
                  className="block w-full text-gray-600 hover:text-gray-700 text-sm"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-golden-600 hover:text-golden-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}