const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export interface StoredUser {
  id: string;
  username: string;
  role: {
    id: string;
    name: string;
    displayName: string;
  };
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

export function setUser(user: StoredUser): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): StoredUser | null {
  if (typeof window !== "undefined") {
    const userStr = sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}
