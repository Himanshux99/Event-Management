import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "../lib/firebaseAuth";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await loginUser(email, password);
      toast.success("Login successful!", {
        description: "Welcome back to CampusHub!",
      });
      // Use replace so the login page is removed from history
      navigate("/", { replace: true }); 
    } catch (error) {
      
      // Better error handling for users
      let message = "An unexpected error occurred.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
            message = "Invalid email or password.";
            break;
          case 'auth/user-not-found':
            message = "No account found with this email.";
            break;
          case 'auth/too-many-requests':
            message = "Too many failed attempts. Try again later.";
            break;
        }
      }
      toast.error(message); 
    } finally {
      setIsLoading(false);
    }
};

  const handleGoogleLogin = () => {
    toast.info("Google login coming soon!", {
      description: "This feature will be available with backend integration.",
    });
  };

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <NeuCard variant="static" className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary border-[3px] border-foreground rounded-2xl shadow-neu mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Welcome Back!</h1>
              <p className="text-muted-foreground">Login to your CampusHub account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <NeuInput
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <NeuInput
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link to="#" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <NeuButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
                <ArrowRight className="w-5 h-5" />
              </NeuButton>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-foreground/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Login */}
            <NeuButton
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </NeuButton>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </NeuCard>
        </motion.div>
      </div>
    </Layout>
  );
}
