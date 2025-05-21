import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SignupProgress } from '../components/signup/SignupProgress';
import { IndividualForm } from '../components/signup/IndividualForm';

export default function IndividualRegistration() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      console.log('Form submitted:', data);
      // Additional handling if needed
    } catch (error) {
      console.error('Error in form submission:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const pageStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'rgb(249, 250, 251)',
      padding: '3rem 1rem',
    },
    innerContainer: {
      maxWidth: '56rem',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: '700',
      color: 'rgb(17, 24, 39)',
      marginBottom: '1rem',
    },
    subtitle: {
      fontSize: '1.125rem',
      color: 'rgb(75, 85, 99)',
    },
    error: {
      backgroundColor: 'rgb(254, 242, 242)',
      color: 'rgb(220, 38, 38)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '2rem',
      textAlign: 'center' as const,
    },
  };

  if (!sessionId) {
    return (
      <div style={pageStyles.container}>
        <div style={pageStyles.innerContainer}>
          <div style={pageStyles.error}>
            Invalid session. Please start the registration process again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.innerContainer}>
        <div style={pageStyles.header}>
          <h1 style={pageStyles.title}>Personal Information</h1>
          <p style={pageStyles.subtitle}>
            Please provide your personal details to continue
          </p>
        </div>

        {submitError && (
          <div style={pageStyles.error}>
            {submitError}
          </div>
        )}

        <SignupProgress currentStep={2} totalSteps={5} />

        <IndividualForm
          sessionId={sessionId}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}