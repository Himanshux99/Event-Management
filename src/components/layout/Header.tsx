import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Calendar, User, LogIn, LogOut , FileSliders } from "lucide-react";
import { NeuButton } from "@/components/ui/NeuButton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/authContext";
import { auth } from "@/lib/firebase";
import{logoutUser} from"@/lib/firebaseAuth";
import React from 'react';
import ThemeToggle from '../ThemeToggle';

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/my-events", label: "My Events" },
  { href: "/organizer", label: "Organizer" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b-[1px] border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary border-[1px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center group-hover:shadow-neu transition-all">
              <FileSliders className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:block ">CampusHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <NeuButton
                  variant={location.pathname === link.href ? "primary" : "ghost"}
                  size="sm"
                >
                  {link.label}
                </NeuButton>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <NeuButton variant="destructive" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </NeuButton>
            ) : (
              <>
                <Link to="/login">
                  <NeuButton variant="outline" size="sm">
                    <LogIn className="w-4 h-4" />
                    Login
                  </NeuButton>
                </Link>
                <Link to="/register">
                  <NeuButton variant="secondary" size="sm">
                    <User className="w-4 h-4" />
                    Sign Up
                  </NeuButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-[1px] border-foreground rounded-xl shadow-neu-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b-[1px] border-foreground overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={cn(
                      "py-3 px-4 rounded-xl font-semibold transition-all",
                      location.pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t-[1px] border-foreground mt-2">
                <div className="flex justify-center mb-2">
                  <ThemeToggle />
                </div>
                {user ? (
                  <NeuButton
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </NeuButton>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <NeuButton variant="outline" className="w-full">
                        Login
                      </NeuButton>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <NeuButton variant="secondary" className="w-full">
                        Sign Up
                      </NeuButton>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
