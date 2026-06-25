import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
      isClubMember: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "user";
    isClubMember: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "user";
    isClubMember: boolean;
  }
}
