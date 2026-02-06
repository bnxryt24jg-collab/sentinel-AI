import { User, HistoryItem, Language } from '../types';

const USERS_KEY = 'sentinel_users';
const SESSION_KEY = 'sentinel_session_user_id';
const HISTORY_PREFIX = 'sentinel_history_';

interface StoredUser extends User {
  passwordHash: string; // In a real app, use bcrypt. Here we simple store string for demo.
  authProvider: 'email' | 'google';
}

// Generate a smiley face avatar based on the user's identifier (seed)
const generateDefaultAvatar = (seed: string) => {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
};

export const authService = {
  // --- Auth Management ---

  getUsers: (): StoredUser[] => {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  },

  saveUser: (user: StoredUser) => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  register: (email: string, password: string): User => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("Identity already exists");
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash: password, // Demo only
      displayName: email.split('@')[0],
      avatar: generateDefaultAvatar(email), // Set default avatar
      lang: 'en',
      authProvider: 'email',
      saveHistory: false // Default to false for privacy
    };

    authService.saveUser(newUser);
    return { ...newUser };
  },

  login: (email: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === password && u.authProvider === 'email');
    if (!user) {
      throw new Error("Invalid credentials");
    }

    let needsUpdate = false;
    // Migration: Assign default avatar if missing
    if (!user.avatar) {
      user.avatar = generateDefaultAvatar(user.email);
      needsUpdate = true;
    }
    // Migration: Default saveHistory to false if undefined
    if (user.saveHistory === undefined) {
      user.saveHistory = false;
      needsUpdate = true;
    }

    if (needsUpdate) authService.saveUser(user);

    localStorage.setItem(SESSION_KEY, user.id);
    return { ...user };
  },

  // Mock Google Login Integration
  loginWithGoogle: (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulation of a Google User returned from OAuth
        const googleEmail = "demo_user@gmail.com";
        const users = authService.getUsers();
        let user = users.find(u => u.email === googleEmail && u.authProvider === 'google');

        if (!user) {
          user = {
            id: crypto.randomUUID(),
            email: googleEmail,
            passwordHash: '', // No password for OAuth users
            displayName: "Google User",
            avatar: generateDefaultAvatar(googleEmail), 
            lang: 'en',
            authProvider: 'google',
            saveHistory: false // Default to false
          };
          authService.saveUser(user);
        } else {
             let needsUpdate = false;
             if (!user.avatar) {
                 user.avatar = generateDefaultAvatar(user.email);
                 needsUpdate = true;
             }
             if (user.saveHistory === undefined) {
                 user.saveHistory = false;
                 needsUpdate = true;
             }
             if (needsUpdate) authService.saveUser(user);
        }

        localStorage.setItem(SESSION_KEY, user.id);
        resolve({ ...user });
      }, 1500); // Simulate network delay
    });
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const users = authService.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
        // Auto-fix defaults for current session if missing
        let needsUpdate = false;
        if (!user.avatar) {
            user.avatar = generateDefaultAvatar(user.email);
            needsUpdate = true;
        }
        if (user.saveHistory === undefined) {
            user.saveHistory = false;
            needsUpdate = true;
        }
        if (needsUpdate) {
            authService.saveUser(user);
            return { ...user }; // Return updated user
        }
        return { ...user };
    }
    return null;
  },

  updateProfile: (userId: string, updates: Partial<User>) => {
    const users = authService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, ...updates };
      authService.saveUser(updatedUser);
      return updatedUser;
    }
    throw new Error("User not found");
  },

  // --- Data Isolation (History) ---

  getUserHistory: (userId: string): HistoryItem[] => {
    try {
      const history = localStorage.getItem(`${HISTORY_PREFIX}${userId}`);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      return [];
    }
  },

  saveUserHistory: (userId: string, history: HistoryItem[]) => {
    localStorage.setItem(`${HISTORY_PREFIX}${userId}`, JSON.stringify(history));
  },

  clearUserHistory: (userId: string) => {
    localStorage.removeItem(`${HISTORY_PREFIX}${userId}`);
  },
  
  deleteHistoryItem: (userId: string, itemId: string) => {
    const history = authService.getUserHistory(userId);
    const updated = history.filter(item => item.id !== itemId);
    authService.saveUserHistory(userId, updated);
    return updated;
  }
};