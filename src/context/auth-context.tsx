'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";

import { apiFetch } from "@/lib/api-client";
import { PreferencesPayload } from "@/lib/types";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  memberSince: string;
  currency: PreferencesPayload["currency"];
  theme: PreferencesPayload["theme"];
  language?: PreferencesPayload["language"];
  notifications: PreferencesPayload["notifications"];
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  preferences: PreferencesPayload | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    location: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updatePreferences: (prefs: PreferencesPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [preferences, setPreferences] =
    useState<PreferencesPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const storeToken = useCallback((value: string | null) => {
    if (value) {
      localStorage.setItem("authToken", value);
    } else {
      localStorage.removeItem("authToken");
    }
    startTransition(() => setToken(value));
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await apiFetch<AuthUser>("/api/auth/me", {}, token);
      const prefs = await apiFetch<PreferencesPayload>("/api/preferences", {}, token);
      startTransition(() => {
        setUser(profile);
        setPreferences(prefs);
      });
    } catch (error) {
      console.error(error);
      storeToken(null);
      startTransition(() => {
        setUser(null);
        setPreferences(null);
      });
    }
  }, [storeToken, token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      startTransition(() => setToken(storedToken));
    } else {
      startTransition(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (!token) {
      startTransition(() => setLoading(false));
      return;
    }

    (async () => {
      await refreshUser();
      startTransition(() => setLoading(false));
    })();
  }, [token, refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      storeToken(data.token);
      startTransition(() => {
        setUser(data.user);
        setPreferences({
          currency: data.user.currency,
          theme: data.user.theme || "dark",
          language: data.user.language || "en",
          notifications: data.user.notifications,
        });
      });
    },
    [storeToken],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone: string,
      location: string,
    ) => {
      const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, phone, location }),
      });
      storeToken(data.token);
      startTransition(() => {
        setUser(data.user);
        setPreferences({
          currency: data.user.currency,
          theme: data.user.theme || "dark",
          language: data.user.language || "en",
          notifications: data.user.notifications,
        });
      });
    },
    [storeToken],
  );

  const logout = useCallback(() => {
    storeToken(null);
    startTransition(() => {
      setUser(null);
      setPreferences(null);
    });
  }, [storeToken]);

  const updatePreferences = useCallback(
    async (prefs: PreferencesPayload) => {
      if (!token) return;
      const updated = await apiFetch<PreferencesPayload>(
        "/api/preferences",
        {
          method: "PUT",
          body: JSON.stringify(prefs),
        },
        token,
      );
      startTransition(() => {
        setPreferences(updated);
        if (user) {
          setUser({
            ...user,
            currency: updated.currency,
            theme: updated.theme || "dark",
            notifications: updated.notifications,
          });
        }
      });
    },
    [token, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      preferences,
      login,
      register,
      logout,
      refreshUser,
      updatePreferences,
    }),
    [
      user,
      token,
      loading,
      preferences,
      login,
      register,
      logout,
      refreshUser,
      updatePreferences,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

