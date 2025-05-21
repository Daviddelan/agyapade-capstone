import React, { useState } from 'react';
import { Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountTypeCard } from '../components/signup/AccountTypeCard';
import { SignupProgress } from '../components/signup/SignupProgress';
import { trackAccountTypeSelection, createTempRegistration } from '../lib/firebase';
import { useIpAddress } from '../hooks/useIpAddress';

type AccountType = 'individual' | 'institution' | null;

export default function AccountTypeSelection() {
  const [selectedType, setSelectedType] = useState<AccountType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ipAddress = useIpAddress();
  const navigate = useNavigate();

  const handleTypeSelection = (type: AccountType) => {
    setSelectedType(type);
    if (type) {
      trackAccountTypeSelection(type);
    }
  };

  const handleContinue = async () => {
    if (!selectedType || !ipAddress) {
      setError('Please select an account type and ensure your IP address is available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting registration process...', { selectedType, ipAddress });
      const sessionId = await createTempRegistration(selectedType, ipAddress);
      console.log('Registration successful with session ID:', sessionId);
      
      if (selectedType === 'individual') {
        navigate(`/signup/terms/${sessionId}`);
      } else {
        // Handle institution flow when implemented
        navigate(`/signup/institution/${sessionId}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'There was an error starting your registration. Please try again.');
    } finally {
      setIsLoading(false);
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
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    errorMessage: {
      color: 'rgb(220, 38, 38)',
      textAlign: 'center',
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: 'rgb(254, 242, 242)',
      border: '1px solid rgb(252, 165, 165)',
      borderRadius: '0.375rem',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    button: {
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      transition: 'all 300ms',
      backgroundColor: selectedType && !isLoading ? 'rgb(247, 183, 50)' : 'rgb(209, 213, 219)',
      color: 'white',
      cursor: selectedType && !isLoading ? 'pointer' : 'not-allowed',
      border: 'none',
      outline: 'none',
    },
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.innerContainer}>
        <div style={pageStyles.header}>
          <h1 style={pageStyles.title}>
            Create Your Account
          </h1>
          <p style={pageStyles.subtitle}>
            Choose your account type to get started
          </p>
        </div>

        <SignupProgress currentStep={1} totalSteps={5} />

        <div style={pageStyles.cardsContainer}>
          <AccountTypeCard
            type="individual"
            title="Individual Account"
            description="Perfect for personal use and individual professionals"
            icon={<User style={{ width: '2rem', height: '2rem', color: 'rgb(247, 183, 50)' }} />}
            selected={selectedType === 'individual'}
            onSelect={() => handleTypeSelection('individual')}
          />

          <AccountTypeCard
            type="institution"
            title="Institution Account"
            description="Ideal for organizations, companies, and teams"
            icon={<Building2 style={{ width: '2rem', height: '2rem', color: 'rgb(247, 183, 50)' }} />}
            selected={selectedType === 'institution'}
            onSelect={() => handleTypeSelection('institution')}
          />
        </div>

        {error && (
          <div style={pageStyles.errorMessage}>
            {error}
          </div>
        )}

        <div style={pageStyles.buttonContainer}>
          <button
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            style={pageStyles.button}
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}