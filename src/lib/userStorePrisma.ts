import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export const userStorePrisma = {
  // Find user by email
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  // Find user by ID
  findById: async (id: number): Promise<User | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  // Create new user with bcrypt password hashing
  create: async (userData: CreateUserData): Promise<User> => {
    try {
      // Hash the password with bcrypt
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const user = await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          name: userData.name,
        },
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Verify password using bcrypt
  verifyPassword: async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  // Get all users (for debugging - remove in production)
  getAll: async (): Promise<User[]> => {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Update user
  update: async (id: number, updateData: Partial<CreateUserData>): Promise<User | null> => {
    try {
      const dataToUpdate: any = {};

      if (updateData.email) {
        dataToUpdate.email = updateData.email.toLowerCase();
      }

      if (updateData.name) {
        dataToUpdate.name = updateData.name;
      }

      if (updateData.password) {
        const saltRounds = 12;
        dataToUpdate.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const user = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  delete: async (id: number): Promise<boolean> => {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },
};
