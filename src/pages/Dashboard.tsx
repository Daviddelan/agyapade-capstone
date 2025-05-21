import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { format } from 'date-fns';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardLayout } from '../components/dashboard/Layout';
import { DocumentList } from '../components/dashboard/DocumentList';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';

interface UserData {
  firstName: string;
  lastName: string;
  title: string;
  lastLogin?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: Date;
  fileUrl?: string;
  privateKey?: string;
  views?: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user data
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        }

        // Fetch documents
        const docsQuery = query(
          collection(db, 'documents'),
          where('userId', '==', user.uid),
          orderBy('uploadDate', 'desc')
        );

        const snapshot = await getDocs(docsQuery);
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadDate: doc.data().uploadDate.toDate()
        })) as Document[];

        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (!userData) return 'Welcome';
    
    const name = userData.title ? `${userData.title} ${userData.lastName}` : userData.firstName;
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${name} ☀️`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${name} 👋`;
    } else {
      return `Good evening, ${name} 🌙`;
    }
  };

  const formatLastLogin = () => {
    if (!userData?.lastLogin) return 'N/A';
    
    try {
      const date = new Date(userData.lastLogin.seconds * 1000);
      return format(date, 'MMM dd');
    } catch (error) {
      console.error('Error formatting last login date:', error);
      return 'N/A';
    }
  };

  const pendingCount = documents.filter(doc => doc.status === 'pending').length;
  const verifiedToday = documents.filter(doc => 
    doc.status === 'verified' && 
    doc.uploadDate.toDateString() === new Date().toDateString()
  ).length;

  if (!user || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Greeting Section */}
        <div className="bg-gradient-to-r from-golden-50 to-white p-8 rounded-2xl shadow-sm">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            {getGreeting()}
          </motion.h1>
          <Player
            autoplay
            loop
            src="/animations/welcome.json"
            style={{ height: '100px' }}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900">Pending Documents</h3>
            <p className="text-3xl font-bold text-golden-600 mt-2">{pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting verification</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900">Verified Today</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{verifiedToday}</p>
            <p className="text-sm text-gray-500 mt-1">Documents verified today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900">Last Login</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatLastLogin()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Previous session</p>
          </motion.div>
        </div>

        {/* Documents Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Your Documents</h2>
          <DocumentList documents={documents} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}