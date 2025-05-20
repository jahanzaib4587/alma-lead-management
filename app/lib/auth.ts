import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define User type inline
interface AppUser {
  id: string;
  name?: string;
  email: string;
  role: "ADMIN" | "USER";
  image?: string;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "ADMIN" | "USER";
    };
  }
  
  interface User {
    id: string;
    role: "ADMIN" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "USER";
  }
}

// Mock users database
const users: AppUser[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@alma.com",
    role: "ADMIN",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@alma.com",
    role: "USER",
    image: "https://randomuser.me/api/portraits/men/85.jpg",
  },
];

export const authOptions: NextAuthOptions = {
  secret: "0fe5cc997d27b0d8b06ab27667d7a7e1",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = users.find((user) => user.email === credentials.email);
        if (user && credentials.password === "password123") {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions); 