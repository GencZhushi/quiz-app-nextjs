import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create the handler
const handler = NextAuth(authOptions);

// Export for Next.js 13+ App Router
export { handler as GET, handler as POST };
