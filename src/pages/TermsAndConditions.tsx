import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SignupProgress } from '../components/signup/SignupProgress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function TermsAndConditions() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAgree = () => {
    if (!signature.trim()) {
      setError('Please enter your full name in capital letters to agree');
      return;
    }

    // Continue to personal information form
    navigate(`/signup/individual/${sessionId}`);
  };

  const handleDisagree = () => {
    // Return to account type selection
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Please read and accept our terms and conditions to continue
          </p>
        </div>

        <SignupProgress currentStep={2} totalSteps={5} />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>
              These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, accessible at our domain.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Intellectual Property Rights</h2>
            <p>
              Other than the content you own, under these Terms, our Company and/or its licensors own all the intellectual property rights and materials contained in this Website.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Restrictions</h2>
            <p>You are specifically restricted from all of the following:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>publishing any Website material in any other media</li>
              <li>selling, sublicensing and/or otherwise commercializing any Website material</li>
              <li>publicly performing and/or showing any Website material</li>
              <li>using this Website in any way that is or may be damaging to this Website</li>
              <li>using this Website contrary to applicable laws and regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Your Content</h2>
            <p>
              In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. No warranties</h2>
            <p>
              This Website is provided "as is," with all faults, and our Company express no representations or warranties, of any kind related to this Website or the materials contained on this Website.
            </p>
          </div>

          <div className="border-t pt-6">
            <p className="mb-4 font-medium">
              To agree to these terms, please type your full name in CAPITAL LETTERS below:
            </p>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="YOUR FULL NAME"
              className="mb-6"
            />

            <div className="flex justify-between">
              <button
                onClick={handleDisagree}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 
                         transition-colors"
              >
                I Disagree
              </button>
              <button
                onClick={handleAgree}
                disabled={!signature.trim()}
                className="px-8 py-2 bg-golden-500 text-white rounded-lg font-medium 
                         hover:bg-golden-600 transition-colors disabled:bg-gray-300 
                         disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                I Agree
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}