import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
    const login = (userData) => {
      setUser(userData);
    };
  
    const logout = () => {
      fetch('http://localhost:8080/logout', { credentials: 'include' });
      setUser(null);
    };
  

  return (
    <AdminContext.Provider value={{ user, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useadmin must be used within a adminProvider');
  }
  return context;
}; 