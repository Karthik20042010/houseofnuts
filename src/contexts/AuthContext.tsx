import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, Permission, ROLE_PERMISSIONS, GoogleUser } from "@/types/auth";
import { getActiveRole, isAdminLoggedIn, adminLogin, adminLogout, setSessionRole } from "@/lib/admin";
import { apiPost } from "@/lib/api";

const GOOGLE_USER_KEY = "hon-google-user";

interface AuthContextType {
  role: UserRole;
  permissions: Permission;
  isLoggedIn: boolean;
  googleUser: GoogleUser | null;
  isGoogleAuthenticated: boolean;
  login: (password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (email: string, name: string, picture?: string) => Promise<GoogleUser>;
  logoutGoogle: () => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (permission: keyof Permission) => boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => getActiveRole());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAdminLoggedIn());
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    const raw = localStorage.getItem(GOOGLE_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GoogleUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ role?: UserRole }>;
      setIsLoggedIn(isAdminLoggedIn());
      if (customEvent.detail?.role) {
        setRole(customEvent.detail.role);
      } else {
        setRole(getActiveRole());
      }
    };

    window.addEventListener("hon-auth-change", handleAuthChange);
    return () => window.removeEventListener("hon-auth-change", handleAuthChange);
  }, []);

  const login = async (password: string, selectedRole: UserRole) => {
    const res = await adminLogin(password, selectedRole);
    if (res.ok) {
      setRole(selectedRole);
      setIsLoggedIn(true);
    }
    return res;
  };

  const loginWithGoogle = async (email: string, name: string, picture?: string): Promise<GoogleUser> => {
    const lowerEmail = email.toLowerCase().trim();
    let userRole: UserRole = "user";
    if (
      lowerEmail === "houseofnutsproddatur@gmail.com" ||
      lowerEmail.startsWith("admin") ||
      lowerEmail.includes("admin")
    ) {
      userRole = "admin";
    } else if (lowerEmail.includes("developer")) {
      userRole = "developer";
    } else if (lowerEmail.includes("staff")) {
      userRole = "staff";
    }

    const user: GoogleUser = {
      email,
      name,
      picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2b2419&color=faf7f2`,
      googleId: "g_" + Math.random().toString(36).substring(2, 10),
    };
    localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
    setGoogleUser(user);

    setSessionRole(userRole);
    setRole(userRole);
    setIsLoggedIn(true);

    // Sync with Google Sheets Apps Script Users Tab (Zero-cost database)
    try {
      await apiPost("registerGoogleUser", {
        userId: user.googleId,
        email: user.email,
        name: user.name,
        role: userRole,
      });
    } catch (e) {
      // Ignore background sync errors
    }

    return user;
  };

  const logoutGoogle = () => {
    localStorage.removeItem(GOOGLE_USER_KEY);
    setGoogleUser(null);
  };

  const logout = () => {
    adminLogout();
    logoutGoogle();
    setRole("user");
    setIsLoggedIn(false);
  };

  const switchRole = (newRole: UserRole) => {
    setSessionRole(newRole);
    setRole(newRole);
  };

  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

  const hasPermission = (perm: keyof Permission): boolean => {
    return !!permissions[perm];
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        permissions,
        isLoggedIn,
        googleUser,
        isGoogleAuthenticated: !!googleUser,
        login,
        loginWithGoogle,
        logoutGoogle,
        logout,
        switchRole,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
