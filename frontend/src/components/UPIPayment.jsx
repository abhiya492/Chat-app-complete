import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const UPIPayment = () => {
  const [plans, setPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/upi/plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load plans');
    }
  };

  const handlePlanSelect = async (planName) => {
    try {
      const res = await fetch(`http://localhost:5001/api/upi/payment-info/${planName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt') || document.cookie.split('jwt=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      setPaymentInfo(data);
      setSelectedPlan(planName);
    } catch (error) {
      toast.error('Failed to get payment info');
    }
  };

  const handlePaymentProof = async () => {
    if (!screenshot || !transactionId) {
      toast.error('Please upload screenshot and enter transaction ID');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('paymentId', paymentInfo.paymentId);
      formData.append('plan', selectedPlan);
      formData.append('transactionId', transactionId);

      const res = await fetch('http://localhost:5001/api/upi/upload-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt') || document.cookie.split('jwt=')[1]?.split(';')[0]}`
        },
        body: formData
      });

      if (res.ok) {
        toast.success('Payment proof uploaded! We will verify within 24 hours.');
        setSelectedPlan(null);
        setPaymentInfo(null);
        setScreenshot(null);
        setTransactionId('');
      } else {
        toast.error('Failed to upload payment proof');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (paymentInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
          
          {/* Payment Details */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-2">
              <p><strong>Plan:</strong> {selectedPlan.toUpperCase()}</p>
              <p><strong>Amount:</strong> ₹{paymentInfo.amount}</p>
              <p><strong>Payment ID:</strong> {paymentInfo.paymentId}</p>
            </div>
          </div>

          {/* UPI Payment Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* QR Code */}
            <div className="text-center">
              <h4 className="font-semibold mb-2">Scan QR Code</h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <img src={paymentInfo.qrCode} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Scan with any UPI app</p>
            </div>

            {/* UPI ID */}
            <div>
              <h4 className="font-semibold mb-2">Pay via UPI ID</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={paymentInfo.upiId} 
                    readOnly 
                    className="flex-1 p-2 border rounded"
                  />
                  <button 
                    onClick={() => copyToClipboard(paymentInfo.upiId)}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={paymentInfo.paymentId} 
                    readOnly 
                    placeholder="Reference ID"
                    className="flex-1 p-2 border rounded"
                  />
                  <button 
                    onClick={() => copyToClipboard(paymentInfo.paymentId)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Copy Ref
                  </button>
                </div>

                <a 
                  href={paymentInfo.upiUrl}
                  className="block w-full text-center py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Pay with UPI App
                </a>
              </div>
            </div>
          </div>

          {/* Upload Proof */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Upload Payment Proof</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UPI transaction ID"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePaymentProof}
                  disabled={loading}
                  className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
                
                <button
                  onClick={() => setPaymentInfo(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">📋 Instructions:</h5>
            <ul className="text-sm space-y-1">
              {paymentInfo.instructions.map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600">Simple UPI payments • Instant activation after verification</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planName, plan]) => (
          <div key={planName} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <h3 className="text-xl font-bold capitalize mb-2">{planName}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              
              <ul className="space-y-2 mb-6 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePlanSelect(planName)}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Select Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>💳 Pay via UPI, PhonePe, Google Pay, Paytm & more</p>
        <p>🔒 Secure • Manual verification • 24-hour activation</p>
      </div>
    </div>
  );
};

export default UPIPayment;