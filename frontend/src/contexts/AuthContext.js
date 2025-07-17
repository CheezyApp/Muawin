import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData && userData !== 'undefined') {
          // Verify token is valid by making a request to the backend
          try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/verify`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              // Token is valid, restore authentication state
              const parsedUser = JSON.parse(userData);
              setIsAuthenticated(true);
              setUser(parsedUser);
            } else {
              // Token is invalid, clear localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (error) {
            // console.error('Error verifying token:', error);


            // On network error, clear auth state for security
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          // No token found or invalid user data, user is not authenticated
          if (token && (!userData || userData === 'undefined')) {
            // Clean up invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        // console.error('Error initializing authentication:', error);

      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 