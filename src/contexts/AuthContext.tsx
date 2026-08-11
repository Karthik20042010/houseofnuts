import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, Permission, ROLE_PERMISSIONS } from "@/types/auth";
import { getActiveRole, isAdminLoggedIn, adminLogin, adminLogout, setSessionRole } from "@/lib/admin";

interface AuthContextType {
  role: UserRole;
  permissions: Permission;
  isLoggedIn: boolean;
  login: (password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (permission: keyof Permission) => boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => getActiveRole());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAdminLoggedIn());

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

  const logout = () => {
    adminLogout();
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
        login,
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
