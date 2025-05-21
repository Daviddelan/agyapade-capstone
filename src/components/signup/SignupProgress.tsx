import React from 'react';

interface SignupProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function SignupProgress({ currentStep, totalSteps }: SignupProgressProps) {
  const progressStyles = {
    container: {
      width: '100%',
      maxWidth: '28rem',
      margin: '0 auto 2rem',
    },
    stepsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    step: {
      width: '2rem',
      height: '2rem',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    connector: {
      flex: '1',
      height: '0.25rem',
      margin: '0 0.5rem',
    },
  };

  const getStepStyle = (index: number) => ({
    ...progressStyles.step,
    backgroundColor: index < currentStep ? 'rgb(247, 183, 50)' : 
                    index === currentStep ? 'white' : 'rgb(229, 231, 235)',
    color: index < currentStep ? 'white' : 
           index === currentStep ? 'rgb(247, 183, 50)' : 'rgb(156, 163, 175)',
    border: index === currentStep ? '2px solid rgb(247, 183, 50)' : 'none',
  });

  const getConnectorStyle = (index: number) => ({
    ...progressStyles.connector,
    backgroundColor: index < currentStep ? 'rgb(247, 183, 50)' : 'rgb(229, 231, 235)',
  });

  return (
    <div style={progressStyles.container}>
      <div style={progressStyles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            {index > 0 && <div style={getConnectorStyle(index)} />}
            <div style={getStepStyle(index)}>
              {index + 1}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}