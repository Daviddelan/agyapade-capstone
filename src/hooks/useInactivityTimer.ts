import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from './use-toast';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 60 * 1000; // 1 minute before timeout

export const useInactivityTimer = () => {
  const { user, lastActivity, logout, updateLastActivity } = useAuthStore();
  const { toast } = useToast();
  const warningTimeoutRef = useRef<number>();
  const logoutTimeoutRef = useRef<number>();

  const resetTimers = () => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);

    if (user) {
      warningTimeoutRef.current = window.setTimeout(() => {
        toast({
          title: "Session Expiring Soon",
          description: "You will be logged out in 1 minute due to inactivity.",
          duration: 60000,
          action: {
            label: "Stay Signed In",
            onClick: () => {
              updateLastActivity();
              resetTimers();
            }
          }
        });
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

      logoutTimeoutRef.current = window.setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      updateLastActivity();
      resetTimers();
    };

    // Set up event listeners for user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => document.addEventListener(event, updateActivity));

    // Initial timer setup
    resetTimers();

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity));
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    };
  }, [user, lastActivity]);
};