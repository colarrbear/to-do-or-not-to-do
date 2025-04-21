import NextAuth from "next-auth";
import authOptionsObj from "@/lib/authOptions";

export const authOptions = authOptionsObj;

// Strongly type the session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
    }
  }
}

export default NextAuth(authOptions);
