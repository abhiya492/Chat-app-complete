// Simple QR Code generator for UPI payments
// You can use this to generate QR codes or use online generators

const generateUPIQR = (upiId, amount, name, note) => {
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  
  // You can use this string with any QR code generator
  // Online: https://www.qr-code-generator.com/
  // Or use qrcode library: npm install qrcode
  
  console.log('UPI String:', upiString);
  return upiString;
};

// Example usage:
// generateUPIQR('yourname@paytm', '299', 'Chat App Pro', 'Pro Plan Subscription');

export default generateUPIQR;