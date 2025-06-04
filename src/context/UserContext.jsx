import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080'; // Fallback for local if .env is missing

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/checkauth`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { 
        credentials: 'include',
        method: 'GET'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 