import { useState } from "react";  
import { useAuthStore } from "../store/useAuthStore";  
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";  
import { Link } from "react-router-dom";  
import AuthImagePattern from "../components/AuthImagePattern";  
import toast from "react-hot-toast";
import GoogleAuthButton from "../components/GoogleAuthButton";
import GitHubAuthButton from "../components/GitHubAuthButton";  

const SignUp = () => {  
  const [showPassword, setShowPassword] = useState(false);  
  const [formData, setFormData] = useState({  
    fullName: "",  
    email: "",  
    password: "",  
  });  

  const { signup, isSigningUp } = useAuthStore();  

  const validateForm = () => {  
    if (!formData.fullName.trim()) return toast.error("Full name is required");  
    if (!formData.email.trim()) return toast.error("Email is required");  
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");  
    if (!formData.password) return toast.error("Password is required");  
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");  
    return true;  
  };  

  const handleSubmit = async (e) => {  
    e.preventDefault();  

    const success = validateForm();  

    if (success === true) {  
      await signup(formData);  
    }  
  };  

  return (  
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-secondary/5 via-base-100 to-primary/5">  
      {/* left side */}  
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">  
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">  
          {/* LOGO */}  
          <div className="text-center mb-8">  
            <div className="flex flex-col items-center gap-2 group">  
              <div  
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3   
              transition-all duration-300 shadow-lg shadow-secondary/20"  
              >  
                <MessageSquare className="w-8 h-8 text-secondary-content" />  
              </div>  
              <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Create Account</h1>  
              <p className="text-base-content/60 text-sm">Get started with your free account</p>  
            </div>  
          </div>  

          <form onSubmit={handleSubmit} className="space-y-5 backdrop-blur-sm bg-base-100/50 p-8 rounded-2xl shadow-xl border border-base-300/50 hover:border-primary/30 transition-all duration-300">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <GoogleAuthButton />
              <GitHubAuthButton />
            </div>

            {/* Divider */}
            <div className="divider text-sm text-base-content/60">OR</div>  
            <div className="form-control">  
              <label className="label">  
                <span className="label-text font-semibold text-sm">Full Name</span>  
              </label>  
              <div className="relative group">  
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">  
                  <User className="size-5 text-base-content/40 group-focus-within:text-primary" />  
                </div>  
                <input  
                  type="text"  
                  className="input input-bordered w-full pl-12 h-12 focus:ring-2 focus:ring-primary/20 transition-all"  
                  placeholder="John Doe"  
                  value={formData.fullName}  
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}  
                />  
              </div>  
            </div>  

            <div className="form-control">  
              <label className="label">  
                <span className="label-text font-semibold text-sm">Email Address</span>  
              </label>  
              <div className="relative group">  
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">  
                  <Mail className="size-5 text-base-content/40 group-focus-within:text-primary" />  
                </div>  
                <input  
                  type="email"  
                  className="input input-bordered w-full pl-12 h-12 focus:ring-2 focus:ring-primary/20 transition-all"  
                  placeholder="you@example.com"  
                  value={formData.email}  
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}  
                />  
              </div>  
            </div>  



            <div className="form-control">  
              <label className="label">  
                <span className="label-text font-semibold text-sm">Password</span>  
              </label>  
              <div className="relative group">  
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">  
                  <Lock className="size-5 text-base-content/40 group-focus-within:text-primary" />  
                </div>  
                <input  
                  type={showPassword ? "text" : "password"}  
                  className="input input-bordered w-full pl-12 pr-12 h-12 focus:ring-2 focus:ring-primary/20 transition-all"  
                  placeholder="••••••••"  
                  value={formData.password}  
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}  
                />  
                <button  
                  type="button"  
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"  
                  onClick={() => setShowPassword(!showPassword)}  
                >  
                  {showPassword ? (  
                    <EyeOff className="size-5 text-base-content/40 hover:text-primary" />  
                  ) : (  
                    <Eye className="size-5 text-base-content/40 hover:text-primary" />  
                  )}  
                </button>  
              </div>  
            </div>  

            <button type="submit" className="btn btn-primary w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all bg-gradient-to-r from-primary to-primary/90 border-0" disabled={isSigningUp}>  
              {isSigningUp ? (  
                <>  
                  <Loader2 className="size-5 animate-spin" />  
                  Creating account...  
                </>  
              ) : (  
                <>  
                  Create Account
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>  
              )}  
            </button>  
          </form>  

          <div className="text-center">  
            <p className="text-base-content/70 text-sm">  
              Already have an account?{" "}  
              <Link to="/login" className="link link-primary font-semibold hover:text-primary/80 transition-colors">  
                Sign in  
              </Link>  
            </p>  
          </div>  
        </div>  
      </div>  

      {/* right side */}  
      <AuthImagePattern  
        title="Join our community"  
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."  
      />  
    </div>  
  );  
};  

export default SignUp;