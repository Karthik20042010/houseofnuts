import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, Permission, ROLE_PERMISSIONS, GoogleUser } from "@/types/auth";
import { getActiveRole, isAdminLoggedIn, adminLogin, adminLogout, setSessionRole } from "@/lib/admin";
import { apiPost } from "@/lib/api";

const GOOGLE_USER_KEY = "hon-google-user";

export function deriveRoleFromEmail(email: string): UserRole {
  const lower = email.toLowerCase().trim();
  if (lower.startsWith("admin@") || lower === "admin" || lower.includes("admin.houseofnuts")) {
    return "admin";
  }
  if (lower.startsWith("developer@") || lower === "developer" || lower.includes("developer.houseofnuts")) {
    return "developer";
  }
  if (lower.startsWith("staff@") || lower === "staff" || lower.includes("staff.houseofnuts")) {
    return "staff";
  }
  // Standard strict match fallback
  if (lower.includes("@admin.") || lower.startsWith("admin_")) return "admin";
  if (lower.includes("@staff.") || lower.startsWith("staff_")) return "staff";
  if (lower.includes("@dev.") || lower.startsWith("dev_")) return "developer";
  return "user";
}

interface AuthContextType {
  role: UserRole;
  permissions: Permission;
  isLoggedIn: boolean;
  googleUser: GoogleUser | null;
  isGoogleAuthenticated: boolean;
  login: (password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (email: string, name: string, picture?: string) => Promise<GoogleUser>;
  loginWithGoogleCredential: (idToken: string) => Promise<GoogleUser | null>;
  logoutGoogle: () => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (permission: keyof Permission) => boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    const raw = localStorage.getItem(GOOGLE_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GoogleUser;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    const active = getActiveRole();
    if (active && active !== "user") return active;
    const raw = localStorage.getItem(GOOGLE_USER_KEY);
    if (raw) {
      try {
        const u = JSON.parse(raw) as GoogleUser;
        return deriveRoleFromEmail(u.email);
      } catch {
        // fallback
      }
    }
    return "user";
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return isAdminLoggedIn() || !!localStorage.getItem(GOOGLE_USER_KEY);
  });

  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ role?: UserRole }>;
      const hasGoogle = !!localStorage.getItem(GOOGLE_USER_KEY);
      setIsLoggedIn(isAdminLoggedIn() || hasGoogle);
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
    const userRole = deriveRoleFromEmail(email);

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
      const res = await apiPost<{ ok: boolean; role?: UserRole }>("registerGoogleUser", {
        userId: user.googleId,
        email: user.email,
        name: user.name,
        role: userRole,
      });
      if (res && res.ok && res.role) {
        setSessionRole(res.role);
        setRole(res.role);
      }
    } catch (e) {
      // Ignore background sync errors
    }

    return user;
  };

  const loginWithGoogleCredential = async (idToken: string): Promise<GoogleUser | null> => {
    try {
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      if (payload && payload.email) {
        return await loginWithGoogle(
          payload.email,
          payload.name || payload.email.split("@")[0],
          payload.picture
        );
      }
    } catch {
      // Fallback
    }
    return null;
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
        loginWithGoogleCredential,
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
