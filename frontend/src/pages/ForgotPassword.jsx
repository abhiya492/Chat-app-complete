import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuthStore();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await forgotPassword(formData.email);
    if (success) setStep(2);
    setIsLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }
    setIsLoading(true);
    const success = await resetPassword(formData.email, formData.otp, formData.newPassword);
    if (success) setStep(3);
    setIsLoading(false);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">
                {step === 1 && "Forgot Password"}
                {step === 2 && "Enter OTP"}
                {step === 3 && "Password Reset"}
              </h1>
              <p className="text-base-content/60">
                {step === 1 && "Enter your email to receive OTP"}
                {step === 2 && "Check your email for the OTP code"}
                {step === 3 && "Your password has been reset successfully"}
              </p>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">OTP Code</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="text-success text-6xl">✓</div>
              <p className="text-lg">Password reset successfully!</p>
              <Link to="/login" className="btn btn-primary w-full">
                Back to Login
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link to="/login" className="link link-primary flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Reset Your Password"
        subtitle="Enter your email to receive an OTP code for password reset."
      />
    </div>
  );
};

export default ForgotPassword;