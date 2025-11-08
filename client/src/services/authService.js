// Simple auth service using localStorage
const AUTH_STORAGE_KEY = 'youtools_auth';

// Predefined admin users
const ADMIN_USERS = [
  {
    id: 1,
    username: 'Kamal@youtools.com',
    password: 'You999404004',
    first_name: 'Kamal',
    last_name: 'YouTools',
    is_admin: true
  },
  {
    id: 2,
    username: 'Rabih@youtools.com',
    password: 'Rabih123',
    first_name: 'Rabih',
    last_name: 'YouTools',
    is_admin: true
  }
];

// Login function
export const login = (username, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
      
      if (user) {
        const authData = {
          user: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            is_admin: user.is_admin
          },
          token: `fake_token_${user.id}_${Date.now()}`
        };
        
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        
        resolve({
          success: true,
          data: authData
        });
      } else {
        resolve({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }, 500); // Simulate API delay
  });
};

// Get current user
export const getCurrentUser = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      const authData = JSON.parse(stored);
      return authData.user;
    } catch (e) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return !!stored;
};

// Logout function
export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return Promise.resolve({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get auth token
export const getToken = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      const authData = JSON.parse(stored);
      return authData.token;
    } catch (e) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return null;
};
