import { useState, useEffect } from 'react';
import { Shield, Key, Lock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { initializeEncryption, getPublicKey, isEncryptionEnabled } from '../lib/e2eEncryption';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const E2EEncryptionSetup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    checkEncryptionStatus();
  }, []);

  const checkEncryptionStatus = () => {
    const enabled = isEncryptionEnabled();
    setIsEnabled(enabled);
    
    if (!enabled) {
      const dismissed = localStorage.getItem('e2e-setup-dismissed');
      if (!dismissed) {
        setShowSetup(true);
      }
    } else {
      setPublicKey(getPublicKey());
    }
  };

  const setupEncryption = async () => {
    setLoading(true);
    try {
      const publicKey = initializeEncryption();
      
      // Send public key to server
      await axiosInstance.put('/auth/update-profile', {
        publicKey,
        encryptionEnabled: true
      });
      
      setIsEnabled(true);
      setPublicKey(publicKey);
      setShowSetup(false);
      toast.success('🔐 End-to-end encryption enabled!');
    } catch (error) {
      console.error('Encryption setup failed:', error);
      toast.error('Failed to setup encryption');
    } finally {
      setLoading(false);
    }
  };

  const dismissSetup = () => {
    setShowSetup(false);
    localStorage.setItem('e2e-setup-dismissed', Date.now().toString());
  };

  if (!showSetup && isEnabled) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Secure Your Chats</h2>
          </div>
          <button onClick={dismissSetup} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
            <p className="text-sm text-base-content/70">
              Protect your messages with military-grade encryption. Only you and your recipient can read them.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm">Messages encrypted on your device</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm">Keys never leave your device</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm">Zero-knowledge architecture</span>
            </div>
          </div>

          <div className="bg-warning/10 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Important</p>
                <p className="text-xs text-base-content/70">
                  If you lose your device, encrypted messages cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={dismissSetup}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Maybe Later
            </button>
            <button
              onClick={setupEncryption}
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Enable Encryption
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default E2EEncryptionSetup;