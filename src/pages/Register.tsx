import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { motion } from "framer-motion";
import { Mail, Lock, User, BookOpen, ArrowRight, UserCheck, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "../lib/firebaseAuth";
import { userDB, collegeDB } from "../lib/firebaseDB";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

type Role = "student" | "organizer";

export default function Register() {
  const [step, setStep] = useState<"role-select" | "form">("role-select");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    college: "",
    branch: "",
    year: "",
    organizationName: "",
    organizerCollege: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const collegesList = await collegeDB.getAll();
        setColleges(collegesList);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        toast.error("Failed to load colleges");
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await createUser(formData.email, formData.password);
      
      const profileData: any = {
        email: formData.email,
        name: formData.name,
        role: selectedRole,
      };

      if (selectedRole === "student") {
        profileData.rollNumber = formData.rollNumber;
        profileData.college = formData.college;
        profileData.branch = formData.branch;
        profileData.year = formData.year;
      } else {
        profileData.organizationName = formData.organizationName;
        profileData.organizerCollege = formData.organizerCollege;
        profileData.contactNumber = formData.contactNumber;
      }

      await userDB.upsert(userCredential.user.uid, profileData);
      
      toast.success("Registration successful!");
      if(selectedRole==="organizer")
        navigate("/organizer-dashboard");
      else
        navigate("/my-events");
    } catch (error) {
      let message = "Registration failed. Please try again.";
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            message = "Email already registered. Try logging in or use a different email.";
            break;
          case "auth/weak-password":
            message = "Password is too weak. Use at least 6 characters.";
            break;
          case "auth/invalid-email":
            message = "Invalid email address.";
            break;
          case "auth/operation-not-allowed":
            message = "Registration is currently disabled.";
            break;
        }
      }
      
      console.error("Registration error:", error);
      toast.error(message);      
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
          {step === "role-select" ? (
            // Step 1: Role Selection
            <NeuCard variant="static" className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-secondary border-[3px] border-foreground rounded-2xl shadow-neu mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Join CampusHub</h1>
                <p className="text-muted-foreground">Choose your account type to get started</p>
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
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-foreground/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-sm text-muted-foreground">or continue as</span>
                </div>
              </div>

              {/* Role Selection Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("student")}
                  className="relative group"
                >
                  <NeuCard className="p-6 text-center h-full border-2 border-transparent hover:border-primary transition-all">
                    <div className="w-12 h-12 bg-primary/20 border-[3px] border-foreground rounded-2xl shadow-neu-sm flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Student</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore events and register for activities
                    </p>
                  </NeuCard>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("organizer")}
                  className="relative group"
                >
                  <NeuCard className="p-6 text-center h-full border-2 border-transparent hover:border-secondary transition-all">
                    <div className="w-12 h-12 bg-secondary/20 border-[3px] border-foreground rounded-2xl shadow-neu-sm flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Organizer</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage campus events
                    </p>
                  </NeuCard>
                </motion.button>
              </div>

              {/* Login Link */}
              <p className="text-center mt-8 text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Login
                </Link>
              </p>
            </NeuCard>
          ) : (
            // Step 2: Registration Form
            <NeuCard variant="static" className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-secondary border-[3px] border-foreground rounded-2xl shadow-neu mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">
                  Create {selectedRole === "organizer" ? "Organizer" : "Student"} Account
                </h1>
                <p className="text-muted-foreground">
                  {selectedRole === "organizer"
                    ? "Sign up to create and manage events as an organizer."
                    : "Join CampusHub and start exploring events as a student."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
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

                {/* Full Name */}
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

                {/* Role-Specific Fields */}
                {selectedRole === "student" ? (
                  <>
                    {/* Student Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
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

                      <div>
                        <label className="block text-sm font-semibold mb-2">Year of Study</label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          className="flex h-12 w-full bg-card border-[3px] border-foreground rounded-[12px] px-4 py-3 text-base font-medium shadow-neu transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">College</label>
                        <select
                          name="college"
                          value={formData.college}
                          onChange={handleChange}
                          className="flex h-12 w-full bg-card border-[3px] border-foreground rounded-[12px] px-4 py-3 text-base font-medium shadow-neu transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          required
                          disabled={loadingColleges}
                        >
                          <option value="">{loadingColleges ? "Loading colleges..." : "Select College"}</option>
                          {colleges.map((college) => (
                            <option key={college.id} value={college.name}>
                              {college.name}
                            </option>
                          ))}
                        </select>
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
                  </>
                ) : (
                  <>
                    {/* Organizer Fields */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Organization Name</label>
                      <NeuInput
                        type="text"
                        name="organizationName"
                        placeholder="Event Club / College Dept"
                        value={formData.organizationName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">College</label>
                      <select
                        name="organizerCollege"
                        value={formData.organizerCollege}
                        onChange={handleChange}
                        className="flex h-12 w-full bg-card border-[3px] border-foreground rounded-[12px] px-4 py-3 text-base font-medium shadow-neu transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        required
                        disabled={loadingColleges}
                      >
                        <option value="">{loadingColleges ? "Loading colleges..." : "Select College"}</option>
                        {colleges.map((college) => (
                          <option key={college.id} value={college.name}>
                            {college.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Contact Phone</label>
                      <NeuInput
                        type="tel"
                        name="contactNumber"
                        placeholder="+91 91234 56789"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Password */}
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

                {/* Buttons */}
                <div className="flex gap-3">
                  <NeuButton
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStep("role-select");
                      setSelectedRole(null);
                    }}
                  >
                    Back
                  </NeuButton>
                  <NeuButton
                    type="submit"
                    variant="secondary"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="w-5 h-5" />
                  </NeuButton>
                </div>
              </form>

              {/* Login Link */}
              <p className="text-center mt-6 text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Login
                </Link>
              </p>
            </NeuCard>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
