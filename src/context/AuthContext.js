import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined=loading, null=unauthenticated

  useEffect(() => {
    const token = localStorage.getItem("kovon_token");
    if (token) {
      api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("kovon_token");
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("kovon_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("kovon_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
