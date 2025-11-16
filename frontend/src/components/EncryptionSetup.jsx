import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { generateKeyPair, storeKeys, hasKeys } from "../lib/encryption";
import { Shield, Loader2 } from "lucide-react";

const EncryptionSetup = () => {
  const { authUser, updatePublicKey } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeEncryption = async () => {
      if (!authUser || hasKeys()) return;

      setIsInitializing(true);
      try {
        const { publicKey, privateKey } = await generateKeyPair();
        storeKeys(publicKey, privateKey);
        await updatePublicKey(publicKey);
      } catch (error) {
        console.error("Failed to initialize encryption:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeEncryption();
  }, [authUser, updatePublicKey]);

  if (!isInitializing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-sm mx-4 text-center">
        <Shield className="size-12 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Setting up encryption</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Generating secure keys for end-to-end encryption...
        </p>
        <Loader2 className="size-6 mx-auto animate-spin text-primary" />
      </div>
    </div>
  );
};

export default EncryptionSetup;
