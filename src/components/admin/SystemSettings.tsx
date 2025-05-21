import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../../hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';

const DEFAULT_SETTINGS = {
  maxFileSize: 10,
  allowedFileTypes: 'pdf,jpg,png',
  documentRetentionDays: 30,
  autoDeleteRejected: false,
  verificationTimeout: 24,
  maxLoginAttempts: 5,
  loginLockoutDuration: 30,
  lastUpdated: null
};

export function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'adminSettings', 'general');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          // Ensure numeric values are valid
          setSettings({
            maxFileSize: Number(data.maxFileSize) || DEFAULT_SETTINGS.maxFileSize,
            allowedFileTypes: data.allowedFileTypes || DEFAULT_SETTINGS.allowedFileTypes,
            documentRetentionDays: Number(data.documentRetentionDays) || DEFAULT_SETTINGS.documentRetentionDays,
            autoDeleteRejected: Boolean(data.autoDeleteRejected),
            verificationTimeout: Number(data.verificationTimeout) || DEFAULT_SETTINGS.verificationTimeout,
            maxLoginAttempts: Number(data.maxLoginAttempts) || DEFAULT_SETTINGS.maxLoginAttempts,
            loginLockoutDuration: Number(data.loginLockoutDuration) || DEFAULT_SETTINGS.loginLockoutDuration,
            lastUpdated: data.lastUpdated
          });
        } else {
          // If document doesn't exist, create it with default settings
          await setDoc(settingsRef, {
            ...DEFAULT_SETTINGS,
            lastUpdated: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load system settings',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleNumberChange = (field: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setSettings(prev => ({
        ...prev,
        [field]: num
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate numeric values before saving
      const validatedSettings = {
        ...settings,
        maxFileSize: Math.max(1, Math.min(50, Number(settings.maxFileSize) || DEFAULT_SETTINGS.maxFileSize)),
        documentRetentionDays: Math.max(1, Number(settings.documentRetentionDays) || DEFAULT_SETTINGS.documentRetentionDays),
        verificationTimeout: Math.max(1, Math.min(72, Number(settings.verificationTimeout) || DEFAULT_SETTINGS.verificationTimeout)),
        maxLoginAttempts: Math.max(1, Math.min(10, Number(settings.maxLoginAttempts) || DEFAULT_SETTINGS.maxLoginAttempts)),
        loginLockoutDuration: Math.max(5, Math.min(1440, Number(settings.loginLockoutDuration) || DEFAULT_SETTINGS.loginLockoutDuration))
      };

      const settingsRef = doc(db, 'adminSettings', 'general');
      await setDoc(settingsRef, {
        ...validatedSettings,
        lastUpdated: serverTimestamp()
      });
      
      setSettings(validatedSettings);
      
      toast({
        title: 'Settings Updated',
        description: 'System settings have been saved successfully.'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-golden-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Document Settings</h2>
        <div className="grid gap-4">
          <div>
            <Label>Maximum File Size (MB)</Label>
            <Input
              type="number"
              value={settings.maxFileSize || ''}
              onChange={(e) => handleNumberChange('maxFileSize', e.target.value)}
              min={1}
              max={50}
            />
          </div>

          <div>
            <Label>Allowed File Types (comma-separated)</Label>
            <Input
              value={settings.allowedFileTypes}
              onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
              placeholder="pdf,jpg,png"
            />
          </div>

          <div>
            <Label>Document Retention Period (days)</Label>
            <Input
              type="number"
              value={settings.documentRetentionDays || ''}
              onChange={(e) => handleNumberChange('documentRetentionDays', e.target.value)}
              min={1}
            />
          </div>

          <div>
            <Label>Verification Timeout (hours)</Label>
            <Input
              type="number"
              value={settings.verificationTimeout || ''}
              onChange={(e) => handleNumberChange('verificationTimeout', e.target.value)}
              min={1}
              max={72}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoDelete"
              checked={settings.autoDeleteRejected}
              onChange={(e) => setSettings({ ...settings, autoDeleteRejected: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="autoDelete">Auto-delete rejected documents</Label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
        <div className="grid gap-4">
          <div>
            <Label>Maximum Login Attempts</Label>
            <Input
              type="number"
              value={settings.maxLoginAttempts || ''}
              onChange={(e) => handleNumberChange('maxLoginAttempts', e.target.value)}
              min={1}
              max={10}
            />
          </div>

          <div>
            <Label>Login Lockout Duration (minutes)</Label>
            <Input
              type="number"
              value={settings.loginLockoutDuration || ''}
              onChange={(e) => handleNumberChange('loginLockoutDuration', e.target.value)}
              min={5}
              max={1440}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-2 bg-golden-600 text-white rounded-lg hover:bg-golden-700 
                 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex 
                 items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </div>
  );
}