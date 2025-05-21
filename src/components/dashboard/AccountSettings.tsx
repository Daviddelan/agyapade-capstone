import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { useToast } from '../../hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';

interface UserSettings {
  firstName: string;
  lastName: string;
  title: string;
}

export function AccountSettings() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    title: '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings(docSnap.data() as UserSettings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load user settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      await updateDoc(doc(db, 'users', user.uid), settings);
      
      toast({
        title: "Settings Updated",
        description: "Your account settings have been saved successfully",
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updatePassword(user, passwords.new);
      
      setPasswords({ current: '', new: '', confirm: '' });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-golden-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h2 className="text-lg font-medium mb-6">Personal Information</h2>
        <form onSubmit={handleSettingsSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={settings.firstName}
                onChange={e => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-golden-500 focus:ring-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={settings.lastName}
                onChange={e => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-golden-500 focus:ring-golden-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <select
              value={settings.title}
              onChange={e => setSettings(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-golden-500 focus:ring-golden-500"
            >
              <option value="">Select Title</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 
                       shadow-sm cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center w-full py-2 px-4 border 
                     border-transparent rounded-md shadow-sm text-sm font-medium 
                     text-white bg-golden-600 hover:bg-golden-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h2 className="text-lg font-medium mb-6">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-golden-500 focus:ring-golden-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-golden-500 focus:ring-golden-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-golden-500 focus:ring-golden-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center w-full py-2 px-4 border 
                     border-transparent rounded-md shadow-sm text-sm font-medium 
                     text-white bg-golden-600 hover:bg-golden-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}