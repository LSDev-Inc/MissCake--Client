import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { AUTH_TOKEN_STORAGE_KEY } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
  });
  const [authLoading, setAuthLoading] = useState(true);

  const persistToken = (value) => {
    const normalized = String(value || "");
    setToken(normalized);

    if (typeof window === "undefined") return;
    if (!normalized) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalized);
  };

  const fetchMe = async () => {
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
      persistToken("");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistToken(data.token);
    setUser(data.user);
    toast.success(`Benvenuto ${data.user.username}`);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistToken(data.token);
    setUser(data.user);
    toast.success("Account creato correttamente");
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network/logout errors: local session must be cleared anyway.
    }
    persistToken("");
    setUser(null);
    toast.success("Logout effettuato");
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    setUser(data.user);
    toast.success("Profilo aggiornato");
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isOwner: user?.role === "owner",
      isStaff: ["admin", "owner"].includes(user?.role),
      login,
      register,
      logout,
      updateProfile,
      refreshUser: fetchMe,
    }),
    [user, token, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
