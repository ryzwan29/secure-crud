import { createContext, ReactNode, useEffect, useState } from "react";
import { authApi, LoginPayload } from "../api/auth.api";
import { SafeUser } from "../types";

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app load there's no access token in memory yet, but a valid
    // httpOnly refresh cookie might still exist from a previous session.
    authApi
      .refresh()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const loggedInUser = await authApi.login(payload);
    setUser(loggedInUser);
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
