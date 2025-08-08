// In-memory user storage (for development only)
export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  name: string;
  createdAt: Date;
}

// In-memory storage
let users: User[] = [];

export const userStore = {
  // Find user by email
  findByEmail: (email: string): User | undefined => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },

  // Find user by ID
  findById: (id: string): User | undefined => {
    return users.find(user => user.id === id);
  },

  // Create new user
  create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
  },

  // Get all users (for debugging)
  getAll: (): User[] => users,

  // Clear all users (for testing)
  clear: (): void => {
    users = [];
  },
};
