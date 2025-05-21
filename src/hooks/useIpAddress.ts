import { useState, useEffect } from 'react';

export const useIpAddress = () => {
  const [ipAddress, setIpAddress] = useState<string>('');

  useEffect(() => {
    const getIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Error fetching IP address:', error);
        setIpAddress('unknown');
      }
    };

    getIpAddress();
  }, []);

  return ipAddress;
};