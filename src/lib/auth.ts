import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { userStorePrisma } from '@/lib/userStorePrisma';

// Auth options - extracted from the NextAuth route for reuse
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await userStorePrisma.findByEmail(credentials.email);
          
          if (!user) {
            return null;
          }

          const isPasswordValid = await userStorePrisma.verifyPassword(
            credentials.password, 
            user.password
          );
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

/**
 * Get the authenticated user's ID from the session
 * @param request - The Next.js request object
 * @returns The user ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(request?: NextRequest): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return null;
    }
    
    // Convert string ID to number (since our User model uses Int)
    const userId = parseInt(session.user.id, 10);
    return isNaN(userId) ? null : userId;
  } catch (error) {
    console.error('Error getting authenticated user ID:', error);
    return null;
  }
}

/**
 * Validate that a user is authenticated and return their ID
 * Throws an error if not authenticated
 * @param request - The Next.js request object
 * @returns The authenticated user's ID
 * @throws Error if user is not authenticated
 */
export async function requireAuthentication(request?: NextRequest): Promise<number> {
  const userId = await getAuthenticatedUserId(request);
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return userId;
}

/**
 * Check if a user owns a specific quiz
 * @param userId - The user's ID
 * @param quizId - The quiz ID to check
 * @returns Promise<boolean> - true if user owns the quiz
 */
export async function userOwnsQuiz(userId: number, quizId: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  
  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        user: { is: { id: userId } }
      }
    });
    
    return quiz !== null;
  } catch (error) {
    console.error('Error checking quiz ownership:', error);
    return false;
  }
}
