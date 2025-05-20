import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real app, you'd check the credentials against your database
        if (
          credentials?.email === "admin@alma.com" &&
          credentials?.password === "password123"
        ) {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@alma.com",
            role: "ADMIN",
            image: "https://randomuser.me/api/portraits/women/32.jpg"
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore - Add custom properties to token
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // @ts-ignore - Add custom properties to session
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: "0fe5cc997d27b0d8b06ab27667d7a7e1", // Make sure this matches the middleware secret
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 