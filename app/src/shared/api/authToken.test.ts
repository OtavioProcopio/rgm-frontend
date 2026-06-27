/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { authToken } from './authToken';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('authToken', () => {
  describe('getAccessToken / setTokens', () => {
    it('returns null when no token stored', () => {
      expect(authToken.getAccessToken()).toBeNull();
    });

    it('returns stored access token', () => {
      authToken.setTokens('access123');
      expect(authToken.getAccessToken()).toBe('access123');
    });

    it('stores refresh token when provided', () => {
      authToken.setTokens('access123', 'refresh456');
      expect(authToken.getRefreshToken()).toBe('refresh456');
    });

    it('does not store refresh token when omitted', () => {
      authToken.setTokens('access123');
      expect(authToken.getRefreshToken()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('removes both tokens', () => {
      authToken.setTokens('a', 'r');
      authToken.clearTokens();
      expect(authToken.getAccessToken()).toBeNull();
      expect(authToken.getRefreshToken()).toBeNull();
    });
  });

  describe('getUser / setUser / clearUser', () => {
    it('returns null when no user stored', () => {
      expect(authToken.getUser()).toBeNull();
    });

    it('returns stored user object', () => {
      authToken.setUser({ id: '1', nome: 'Otávio' });
      expect(authToken.getUser()).toEqual({ id: '1', nome: 'Otávio' });
    });

    it('returns null and cleans up when stored value is invalid JSON', () => {
      localStorage.setItem('rgm.user', 'not-json');
      expect(authToken.getUser()).toBeNull();
      expect(localStorage.getItem('rgm.user')).toBeNull();
    });

    it('clearUser removes stored user', () => {
      authToken.setUser({ id: '1' });
      authToken.clearUser();
      expect(authToken.getUser()).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('removes tokens and user', () => {
      authToken.setTokens('a', 'r');
      authToken.setUser({ id: '1' });
      authToken.clearSession();
      expect(authToken.getAccessToken()).toBeNull();
      expect(authToken.getRefreshToken()).toBeNull();
      expect(authToken.getUser()).toBeNull();
    });
  });
});
