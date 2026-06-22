import * as SecureStore from "expo-secure-store";

/** Matches Clerk's expected token cache shape (avoids deep import path). */
type TokenCache = {
  getToken: (key: string) => Promise<string | null | undefined>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
};

/**
 * Persists Clerk's session token in the device secure store so the user
 * stays signed in across launches. See docs.clerk.com Expo setup.
 */
export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // swallow — a failed cache write just means re-auth next launch
    }
  },
};
