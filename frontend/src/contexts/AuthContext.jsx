import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, handleApiError } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // User is logged in, you could fetch user data here if needed
      setUserData({ token });
    }
    setLoading(false);
  }, []);

  const handleRegister = async (name, username, password) => {
    try {
      const response = await userAPI.register({ name, username, password });
      return response.message;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await userAPI.login({ username, password });
      
      localStorage.setItem("token", response.token);
      setUserData({ token: response.token });
      
      navigate("/home");
      return response.message;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/auth");
  };

  const getHistoryOfUser = async () => {
    try {
      const activities = await userAPI.getAllActivities();
      return activities;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      const response = await userAPI.addActivity(meetingCode);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const value = {
    userData,
    setUserData,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    getHistoryOfUser,
    addToUserHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};