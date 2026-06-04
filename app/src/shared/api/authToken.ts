const ACCESS_TOKEN_KEY = 'rgm.accessToken';
const REFRESH_TOKEN_KEY = 'rgm.refreshToken';
const USER_KEY = 'rgm.user';

function readJson<TValue>(key: string): TValue | null {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as TValue;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export const authToken = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getUser<TUser>() {
    return readJson<TUser>(USER_KEY);
  },

  setUser<TUser>(user: TUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(USER_KEY);
  },

  clearSession() {
    this.clearTokens();
    this.clearUser();
  },
};
