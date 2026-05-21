import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    error?: "SessionRevoked";
  }

  interface User {
    sessaoVersao?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessaoVersao?: number;
    error?: "SessionRevoked";
  }
}
