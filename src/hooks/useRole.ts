import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../types/roles';

export function useRole() {
  const { user } = useAuthStore();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    // Set up real-time listener for role changes
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          console.log('Current user role:', userData.role); // Debug log
          setRole(userData.role as UserRole || 'user');
        } else {
          console.log('No user document found'); // Debug log
          setRole('user');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user role:', error);
        setRole('user');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  return { role, loading };
}