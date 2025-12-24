import { User } from "@/types/schema";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Local storage keys
const USERS_KEY = "manus_mock_users";
const CURRENT_USER_KEY = "manus_mock_current_user";
const TOKENS_KEY = "manus_mock_tokens";

// Helper to get users from local storage
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to local storage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authApi = {
  // Register a new user
  register: async (email: string, password: string, name?: string): Promise<{ user: User; token: string }> => {
    await delay(800);
    
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error("このメールアドレスは既に登録されています");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "tenant_" + Math.random().toString(36).substr(2, 9),
      name: name || email.split("@")[0],
      email,
      role: "admin", // Default to admin for MVP
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto login
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    const token = "mock_token_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(TOKENS_KEY, token);

    return { user: newUser, token };
  },

  // Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await delay(800);

    const users = getUsers();
    const user = users.find((u) => u.email === email);

    // Mock password check (in reality, we would hash and compare)
    // For MVP mock, we just check if user exists. 
    // Ideally we should store password hash in a separate mock storage but for UI demo this is fine.
    if (!user) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    const token = "mock_token_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(TOKENS_KEY, token);

    return { user, token };
  },

  // Logout
  logout: async (): Promise<void> => {
    await delay(500);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKENS_KEY);
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    // await delay(200); // No delay for initial load to prevent flicker
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await delay(1000);
    // In a real app, this would send an email.
    // Here we just simulate success if the email format is valid.
    if (!email.includes("@")) {
      throw new Error("有効なメールアドレスを入力してください");
    }
    // We don't reveal if user exists or not for security (as per spec)
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await delay(1000);
    // Mock implementation
    if (newPassword.length < 8) {
      throw new Error("パスワードは8文字以上で入力してください");
    }
  }
};
