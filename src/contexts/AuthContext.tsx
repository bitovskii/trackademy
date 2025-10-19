import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';

interface User {
  id: string; // Changed to string since API returns GUID
  fullName: string;
  login: string;
  email: string;
  role: string; // Changed to string since API returns role names like "Administrator"
  organizationId?: string;
  organizationNames?: string; // Add organization name from API
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  loginWithCredentials: (login: string, password: string, organizationId?: string) => Promise<void>;
  getAuthToken: () => string | null;
}

interface RegisterData {
  fullName: string;
  login: string;
  email: string;
  password: string;
  phone: string;
  role: number; // Keep as number for registration API
  organizationId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Also remove the JWT token
    localStorage.removeItem('userLogin'); // Clear saved login
    localStorage.removeItem('userOrganizationId'); // Clear saved org ID
    
    // Redirect to home page after logout
    globalThis.location.href = '/';
  };

  const register = async (userData: RegisterData) => {
    try {
      // Split fullName into firstName and lastName for API
      const nameParts = userData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Format the request according to API expectations
      const requestPayload = {
        firstName: firstName,
        lastName: lastName,
        fullName: userData.fullName,
        login: userData.login,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
        ...(userData.organizationId && { organizationId: userData.organizationId })
      };

      console.log('Sending registration request:', requestPayload);

      const response = await fetch('https://trackademy.onrender.com/api/Auth/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error('Registration failed');
      }

      const result = await response.json();
      console.log('Registration success:', result);
      
      // Store login and organizationId in localStorage
      localStorage.setItem('userLogin', userData.login);
      if (userData.organizationId) {
        localStorage.setItem('userOrganizationId', userData.organizationId);
      }
      
      // Redirect to login page instead of auto-login
      globalThis.location.href = '/login';
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginWithCredentials = useCallback(async (userLogin: string, password: string, organizationId?: string) => {
    try {
      const loginPayload: { login: string; password: string; organizationId?: string } = { login: userLogin, password };
      if (organizationId) {
        loginPayload.organizationId = organizationId;
      }

      const response = await fetch('https://trackademy.onrender.com/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error('Invalid login or password');
      }

      const result = await response.json();
      console.log('Login API response:', result);
      
      // Extract user data from the API response structure
      const userData: User = {
        id: result.user.id,
        fullName: result.user.fullName,
        login: result.user.login,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
        organizationNames: result.user.organizationNames
      };

      // Store the JWT token separately
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

      login(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [login]);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loginWithCredentials,
    getAuthToken
  }), [user, login, logout, register, loginWithCredentials, getAuthToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}