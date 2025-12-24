import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/utils/auth";

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key]?.trim();
  if (!value && !defaultValue) {
    throw new Error(`[next-auth][error] ${key} is not set in environment variables.`);
  }
  return value || defaultValue!;
};

const NEXTAUTH_SECRET = getEnvVar("NEXTAUTH_SECRET");
const NEXTAUTH_URL = getEnvVar(
  "NEXTAUTH_URL",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined
);

console.log("[next-auth] Configuration check:", {
  hasSecret: !!NEXTAUTH_SECRET,
  secretLength: NEXTAUTH_SECRET?.length,
  hasUrl: !!NEXTAUTH_URL,
  url: NEXTAUTH_URL,
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { role: true },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValidPassword = verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          roleId: user.roleId,
          role: user.role.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.roleId = user.roleId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.userId as string,
          username: token.username as string,
          roleId: token.roleId as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

