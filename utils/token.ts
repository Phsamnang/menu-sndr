import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

export interface StoredUser {
  id: string;
  username: string;
  role: {
    id: string;
    name: string;
    displayName: string;
  };
}

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

let cachedToken: string | null = null;
let cachedUser: StoredUser | null = null;

export async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedToken) {
    return cachedToken;
  }

  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  const storedToken = sessionStorage.getItem(TOKEN_KEY);
  if (storedToken) {
    cachedToken = storedToken;
    return storedToken;
  }

  return null;
}

export function getTokenSync(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedToken) {
    return cachedToken;
  }

  const storedToken = sessionStorage.getItem(TOKEN_KEY);
  if (storedToken) {
    cachedToken = storedToken;
    return storedToken;
  }

  return null;
}

export async function getUser(): Promise<StoredUser | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedUser) {
    return cachedUser;
  }

  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  const storedUserStr = sessionStorage.getItem(USER_KEY);
  if (storedUserStr) {
    try {
      const user = JSON.parse(storedUserStr);
      cachedUser = user;
      return user;
    } catch {
      return null;
    }
  }

  try {
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const user: StoredUser = {
          id: result.data.id,
          username: result.data.username,
          role: {
            id: result.data.role.id,
            name: result.data.role.name,
            displayName: result.data.role.displayName,
          },
        };
        cachedUser = user;
        setUser(user);
        return user;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getUserSync(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedUser) {
    return cachedUser;
  }

  const userStr = sessionStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      cachedUser = user;
      return user;
    } catch {
      return null;
    }
  }

  return null;
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, token);
    cachedToken = token;
  }
}

export function setUser(user: StoredUser): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    cachedUser = user;
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    cachedToken = null;
    cachedUser = null;
  }
}
