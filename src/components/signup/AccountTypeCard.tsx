import React from 'react';
import { Check } from 'lucide-react';

interface AccountTypeCardProps {
  type: 'individual' | 'institution';
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export function AccountTypeCard({
  type,
  title,
  description,
  icon,
  selected,
  onSelect,
}: AccountTypeCardProps) {
  const cardStyles = {
    container: {
      position: 'relative' as const,
      cursor: 'pointer',
      borderRadius: '0.75rem',
      border: `2px solid ${selected ? 'rgb(247, 183, 50)' : 'rgb(229, 231, 235)'}`,
      padding: '1.5rem',
      transition: 'all 300ms',
      backgroundColor: selected ? 'rgb(255, 249, 235)' : 'white',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      gap: '1rem',
      '&:hover': {
        borderColor: 'rgb(247, 183, 50)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    checkmark: {
      position: 'absolute' as const,
      right: '1rem',
      top: '1rem',
      backgroundColor: 'rgb(247, 183, 50)',
      borderRadius: '9999px',
      padding: '0.25rem',
    },
    iconContainer: {
      borderRadius: '9999px',
      padding: '1rem',
      transition: 'background-color 300ms',
      backgroundColor: selected ? 'rgb(254, 242, 214)' : 'rgb(243, 244, 246)',
    },
    titleContainer: {
      marginTop: '0.5rem',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'rgb(17, 24, 39)',
      marginBottom: '0.5rem',
    },
    description: {
      color: 'rgb(75, 85, 99)',
    },
  };

  return (
    <div
      onClick={onSelect}
      style={{
        ...cardStyles.container,
        '&:hover': cardStyles.container['&:hover'],
      }}
    >
      {selected && (
        <div style={cardStyles.checkmark}>
          <Check style={{ width: '1rem', height: '1rem', color: 'white' }} />
        </div>
      )}
      
      <div style={cardStyles.iconContainer}>
        {icon}
      </div>

      <div style={cardStyles.titleContainer}>
        <h3 style={cardStyles.title}>{title}</h3>
        <p style={cardStyles.description}>{description}</p>
      </div>
    </div>
  );
}