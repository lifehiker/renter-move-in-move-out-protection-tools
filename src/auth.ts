import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { appEnv, hasGoogleAuth } from "@/lib/env";

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    ...(hasGoogleAuth()
      ? [
          Google({
            clientId: appEnv.googleClientId!,
            clientSecret: appEnv.googleClientSecret!,
          }),
        ]
      : []),
    Credentials({
      name: "Demo mode",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email =
          (credentials?.email as string | undefined)?.trim().toLowerCase() ||
          "demo@rentready.local";
        const name =
          (credentials?.name as string | undefined)?.trim() || "Demo renter";

        const user = await prisma.user.upsert({
          where: { email },
          update: { name },
          create: { email, name },
        });

        await prisma.subscription.upsert({
          where: { id: `sub-${user.id}` },
          update: { userId: user.id },
          create: {
            id: `sub-${user.id}`,
            userId: user.id,
            status: "FREE",
            plan: "FREE",
            provider: "LOCAL",
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  secret: appEnv.authSecret,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
