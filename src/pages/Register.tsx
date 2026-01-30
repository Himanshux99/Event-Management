import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { motion } from "framer-motion";
import { Mail, Lock, User, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { create } from "domain";
import { createUser} from "../lib/firebaseAuth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    college: "",
    branch: "",
    year: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    
    try {
      await createUser(formData.email, formData.password);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error("Registration failed. Please try again.");      
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info("Google signup coming soon!", {
      description: "This feature will be available with backend integration.",
    });
  };

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <NeuCard variant="static" className="p-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary border-[1px] border-foreground rounded-2xl shadow-neu mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-muted-foreground">Join CampusHub and start exploring events</p>
            </div>

            {/* Google Signup */}
            <NeuButton
              variant="outline"
              className="w-full mb-6"
              onClick={handleGoogleSignup}
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
              Sign up with Google
            </NeuButton>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-foreground/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">or sign up with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <NeuInput
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Roll Number</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <NeuInput
                      type="text"
                      name="rollNumber"
                      placeholder="21CS1234"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">College Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <NeuInput
                    type="email"
                    name="email"
                    placeholder="you@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">College</label>
                  <NeuInput
                    type="text"
                    name="college"
                    placeholder="ABC Engineering College"
                    value={formData.college}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Branch</label>
                  <NeuInput
                    type="text"
                    name="branch"
                    placeholder="Computer Science"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="flex h-12 w-full bg-card border-[1px] border-foreground rounded-[12px] px-4 py-3 text-base font-medium shadow-neu transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <NeuInput
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <NeuInput
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>
              </div>

              <NeuButton
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </NeuButton>
            </form>

            {/* Login Link */}
            <p className="text-center mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Login
              </Link>
            </p>
          </NeuCard>
        </motion.div>
      </div>
    </Layout>
  );
}
