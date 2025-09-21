import React, { createContext, useContext, useState, useEffect } from "react";
import api from "./api";
import { getToken, getUser, saveSession, clearSession } from "./auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    if (token) api.setToken(token);
  }, [token]);

  const login = async (credentials) => {
    try {
      const data = await api.login(credentials);
      if (data.access_token) {
        setToken(data.access_token);
        api.setToken(data.access_token);
        const userData = await api.getCurrentUser();
        saveSession(data.access_token, userData);
        setUser(userData);
        return data;
      }
      throw new Error("No access token received");
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      throw error;
    }
  };

  const logout = async () => {
    await api.logout();
    clearSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}