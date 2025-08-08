import pool from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export const userStorePostgres = {
  // Find user by email
  findByEmail: async (email: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Find user by ID
  findById: async (id: number): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Create new user with bcrypt password hashing
  create: async (userData: CreateUserData): Promise<User> => {
    const client = await pool.connect();
    try {
      // Hash the password with bcrypt
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const result = await client.query(
        `INSERT INTO users (email, password, name, created_at, updated_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [userData.email.toLowerCase(), hashedPassword, userData.name]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
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
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Update user
  update: async (id: number, updateData: Partial<CreateUserData>): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      if (updateData.email) {
        setClause.push(`email = $${paramCount}`);
        values.push(updateData.email.toLowerCase());
        paramCount++;
      }

      if (updateData.name) {
        setClause.push(`name = $${paramCount}`);
        values.push(updateData.name);
        paramCount++;
      }

      if (updateData.password) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        setClause.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      }

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${setClause.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;

      const result = await client.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete user
  delete: async (id: number): Promise<boolean> => {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};
