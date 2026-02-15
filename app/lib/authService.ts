// Auth service utilities
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Use mock mode if no API URL is set (for development/UI preview)
const USE_MOCK_MODE = !API_URL || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
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
  // Mock mode for UI preview
  if (USE_MOCK_MODE) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock successful login
    const mockResponse: AuthResponse = {
      token: "mock_token_" + Date.now(),
      user: {
        id: "1",
        email: credentials.email,
        firstName: "John",
        lastName: "Doe",
        username: credentials.email.split("@")[0],
      },
    };
    return mockResponse;
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Mock mode for UI preview
  if (USE_MOCK_MODE) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock successful registration
    const mockResponse: AuthResponse = {
      token: "mock_token_" + Date.now(),
      user: {
        id: "1",
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.email.split("@")[0],
      },
    };
    return mockResponse;
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
};

export const forgotPassword = async (email: string): Promise<void> => {
  // Mock mode for UI preview
  if (USE_MOCK_MODE) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock successful - just return without error
    return;
  }

  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send reset email");
  }
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  // Mock mode for UI preview
  if (USE_MOCK_MODE) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock successful - just return without error
    return;
  }

  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Password reset failed");
  }
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

