import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userDB } from "@/lib/firebaseDB";

export type Role = "student" | "organizer";

export interface AppUser {
  uid: string;
  email: string | null;
  name?: string | null;
  role: Role;
  college?: string | null;
  organizerCollege?: string | null;
}

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Temporary mock roles fallback (if Firestore profile not found)
const MOCK_USER_ROLES: Record<string, Role> = {
  // example: 'uid123': 'organizer'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // try to fetch user profile from Firestore
        try {
          const profile: any = await userDB.getById(fbUser.uid);
          console.log("Fetched profile from Firestore:", profile);
          
          const role: Role = (profile && (profile.role as Role)) || MOCK_USER_ROLES[fbUser.uid] || "student";
          console.log("Determined role:", role);

          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email,
            name: (profile && profile.name) || fbUser.displayName || null,
            role,
            college: profile?.college || null,
            organizerCollege: profile?.organizerCollege || null,
          });
        } catch (err) {
          console.error("Error fetching profile:", err);
          // fallback to basic user with default role
          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || null,
            role: MOCK_USER_ROLES[fbUser.uid] || "student",
          });
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
