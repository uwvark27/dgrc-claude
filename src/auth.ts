import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { clubMembers, users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const [membership] = await db
          .select({ id: clubMembers.id })
          .from(clubMembers)
          .where(
            and(eq(clubMembers.userId, user.id), eq(clubMembers.isActive, true)),
          )
          .limit(1);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isClubMember: !!membership,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as { role: "admin" | "user"; isClubMember: boolean };
        token.role = u.role;
        token.isClubMember = u.isClubMember;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as "admin" | "user";
        session.user.isClubMember = token.isClubMember as boolean;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});
