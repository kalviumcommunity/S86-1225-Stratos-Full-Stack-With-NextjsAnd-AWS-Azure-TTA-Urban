import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from '@/models/User';
import { UserRole, USER_ROLES } from '@/utils/constants';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account is disabled. Please contact admin.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // Validate Google profile
          if (!user.email) {
            console.error('Google sign-in failed: No email provided');
            return false;
          }
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user from Google account
            console.log('Creating new user from Google OAuth:', user.email);
            existingUser = await User.create({
              name: user.name || 'Google User',
              email: user.email,
              role: USER_ROLES.CITIZEN, // Default role for OAuth users
              isActive: true,
              // No password for OAuth users
            });
            console.log('New Google user created successfully:', existingUser._id);
          } else {
            console.log('Existing user found for Google OAuth:', existingUser._id);
          }
          
          // Check if user account is active
          if (!existingUser.isActive) {
            console.error('Google sign-in failed: Account is disabled for', user.email);
            return false;
          }
          
          // Store user ID and role for JWT callback
          user.id = existingUser._id.toString();
          (user as any).role = existingUser.role;
          
          console.log('Google sign-in successful for:', user.email, 'Role:', existingUser.role);
          return true;
        } catch (error) {
          console.error('Error in Google sign-in:', error);
          if (error instanceof Error) {
            console.error('Error details:', error.message);
          }
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // On sign in, set the user data in token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
        console.log('JWT callback - Sign in - Role:', (user as any).role, 'Email:', user.email);
      } else if (token.email) {
        // On subsequent requests, always verify role from database to prevent role changes
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            // Always update role from database to ensure it's current
            const dbRole = dbUser.role;
            if (token.role !== dbRole) {
              console.log('JWT callback - Role mismatch! Token has:', token.role, 'DB has:', dbRole, 'Email:', token.email);
            }
            token.role = dbRole;
            token.id = dbUser._id.toString();
            token.name = dbUser.name;
          }
        } catch (error) {
          console.error('Error fetching user role from DB:', error);
        }
      }
      
      console.log('JWT callback - Final token role:', token.role, 'Email:', token.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        console.log('Session callback - Role:', token.role, 'for user:', session.user.email);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      console.log('Redirect callback - URL:', url, 'BaseURL:', baseUrl);
      
      // If redirecting to the base URL or sign-in page, redirect based on role
      if (url === baseUrl || url.startsWith(baseUrl + '/login')) {
        // We need to get the user's role to redirect properly
        // This will be handled by the login page after sign-in
        return `${baseUrl}/complaints`;
      }
      
      // Allow callback URLs within the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Default to base URL
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
