"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthTokens, getAuthToken, setAuthTokens } from "@/lib/auth-storage";
import { authService, LoginInput, SignupInput } from "@/services/auth.service";
import { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.me();
      setUser(currentUser);
    } catch {
      clearAuthTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authService.login(input);
    setAuthTokens(result.token, result.refreshToken);
    setUser(result.user);
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const result = await authService.signup(input);
    setAuthTokens(result.token, result.refreshToken);
    setUser(result.user);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      refreshUser
    }),
    [isLoading, login, logout, refreshUser, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
