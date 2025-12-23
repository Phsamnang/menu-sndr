import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      roleId: string;
      role: string;
    };
  }

  interface User {
    id: string;
    username: string;
    roleId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    username: string;
    roleId: string;
    role: string;
  }
}

