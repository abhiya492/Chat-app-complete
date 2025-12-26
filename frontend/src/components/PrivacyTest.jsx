import { useState } from "react";
import { axiosInstance } from "../lib/axios";

const PrivacyTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Encryption Key Generation
      const keyRes = await axiosInstance.post('/privacy/encryption/keypair');
      testResults.encryption = keyRes.data ? '✅ Working' : '❌ Failed';
    } catch (error) {
      testResults.encryption = `❌ Error: ${error.response?.data?.error || error.message}`;
    }

    try {
      // Test 2: Privacy Health Score
      const healthRes = await axiosInstance.get('/privacy/health');
      testResults.privacyScore = healthRes.data ? '✅ Working' : '❌ Failed';
    } catch (error) {
      testResults.privacyScore = `❌ Error: ${error.response?.data?.error || error.message}`;
    }

    try {
      // Test 3: Anonymous Session
      const anonRes = await axiosInstance.post('/privacy/anonymous/session', {
        settings: { nickname: 'TestUser' }
      });
      testResults.anonymousChat = anonRes.data ? '✅ Working' : '❌ Failed';
    } catch (error) {
      testResults.anonymousChat = `❌ Error: ${error.response?.data?.error || error.message}`;
    }

    try {
      // Test 4: Privacy Settings
      const settingsRes = await axiosInstance.get('/privacy/settings');
      testResults.privacySettings = settingsRes.status === 200 ? '✅ Working' : '❌ Failed';
    } catch (error) {
      testResults.privacySettings = `❌ Error: ${error.response?.data?.error || error.message}`;
    }

    try {
      // Test 5: Blockchain Stats
      const blockchainRes = await axiosInstance.get('/privacy/blockchain/stats');
      testResults.blockchain = blockchainRes.data ? '✅ Working' : '❌ Failed';
    } catch (error) {
      testResults.blockchain = `❌ Error: ${error.response?.data?.error || error.message}`;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Privacy Features Test</h1>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        className="btn btn-primary mb-6"
      >
        {loading ? 'Testing...' : 'Run Privacy Tests'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Test Results:</h2>
          
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="space-y-2">
                <div>🔐 Encryption: {results.encryption}</div>
                <div>📊 Privacy Score: {results.privacyScore}</div>
                <div>👤 Anonymous Chat: {results.anonymousChat}</div>
                <div>⚙️ Privacy Settings: {results.privacySettings}</div>
                <div>⛓️ Blockchain: {results.blockchain}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyTest;