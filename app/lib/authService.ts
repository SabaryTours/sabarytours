// Auth service utilities - Mock mode only
// Replace with actual auth implementation when ready

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username?: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Mock login - replace with actual auth implementation when ready
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const mockResponse: AuthResponse = {
    token: "mock_token_" + Date.now(),
    user: {
      id: "1",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      username: credentials.username,
    },
  };
  return mockResponse;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Mock registration - replace with actual auth implementation when ready
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const mockResponse: AuthResponse = {
    token: "mock_token_" + Date.now(),
    user: {
      id: "1",
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
    },
  };
  return mockResponse;
};

export const forgotPassword = async (email: string): Promise<void> => {
  // Mock forgot password - replace with actual implementation when ready
  await new Promise((resolve) => setTimeout(resolve, 500));
  return;
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  // Mock reset password - replace with actual implementation when ready
  await new Promise((resolve) => setTimeout(resolve, 500));
  return;
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

