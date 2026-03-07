import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const MOCK_USER = {
          id: "clinician-1",
          name: "Dr. Jane Doe",
          email: "clinician@example.com",
          role: "oncologist" as const
        };

        if (
          credentials?.email === "clinician@example.com" &&
          credentials?.password === "password123"
        ) {
          return MOCK_USER;
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/auth/signin"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role ?? "oncologist";
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);

