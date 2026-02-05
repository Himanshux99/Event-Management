import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Calendar, User, LogIn, LogOut, Settings } from "lucide-react";
import { NeuButton } from "@/components/ui/NeuButton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/authContext";
import type { Role } from "@/context/authContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const role: Role | undefined = currentUser?.role;

  const navLinks = (() => {
    const links: { href: string; label: string }[] = [];
    if (!currentUser) return links;

    if (role === "student") {
      links.push({ href: "/events", label: "Events" });
      links.push({ href: "/my-events", label: "My Events" });
    }

    if (role === "organizer") {
      links.push({ href: "/organizer", label: "Dashboard" });
      links.push({ href: "/organizer/create-event", label: "Create Event" });
    }

    return links;
  })();

  return (
    <header className="sticky top-0 z-50 bg-background border-b-[3px] border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary border-[3px] border-foreground rounded-xl shadow-neu-sm flex items-center justify-center group-hover:shadow-neu transition-all">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:block">CampusHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.href} to={link.href} className={({ isActive }) => "rounded-md"}>
                <NeuButton
                  variant={location.pathname === link.href ? "primary" : "ghost"}
                  size="sm"
                >
                  {link.label}
                </NeuButton>
              </NavLink>
            ))}
          </nav>

          {/* Desktop Avatar / Auth */}
          <div className="hidden md:flex items-center gap-3 relative">
            {currentUser ? (
              <>
                <button
                  onClick={() => setAvatarOpen((s) => !s)}
                  className="flex items-center gap-2 p-1 rounded-full hover:shadow-neu"
                >
                  <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center font-semibold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-14 w-44 bg-background border-[1px] border-foreground rounded-xl shadow-neu p-2">
                    <Link to="/profile" onClick={() => setAvatarOpen(false)}>
                      <div className="py-2 px-3 hover:bg-muted rounded-md flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Link to="/settings" onClick={() => setAvatarOpen(false)}>
                      <div className="py-2 px-3 hover:bg-muted rounded-md flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </div>
                    </Link>
                    <div className="py-2 px-3 hover:bg-muted rounded-md flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </>
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
            className="md:hidden p-2 border-[3px] border-foreground rounded-xl shadow-neu-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
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
            className="md:hidden bg-background border-b-[3px] border-foreground overflow-hidden"
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
              <div className="pt-4 border-t-[3px] border-foreground mt-2 space-y-2">
                {currentUser ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <div className="py-3 px-4 rounded-xl font-semibold transition-all hover:bg-muted flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <div className="py-3 px-4 rounded-xl font-semibold transition-all hover:bg-muted flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </div>
                    </Link>
                    <NeuButton
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </NeuButton>
                  </>
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
