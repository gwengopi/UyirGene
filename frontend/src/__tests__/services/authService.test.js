import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, getCurrentUser, logout, hasRole } from '../../services/authService';
import api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('sends login request with credentials', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com' },
        },
      };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await login('test@example.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('throws error on login failure', async () => {
      api.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(login('test@example.com', 'wrong')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('sends registration request with user data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = { data: { id: 1, ...userData } };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await register(userData);

      expect(api.post).toHaveBeenCalledWith('/api/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user data', async () => {
      const mockUser = { id: 1, name: 'Test', email: 'test@example.com' };
      api.get.mockResolvedValueOnce({ data: mockUser });

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('clears authentication data', () => {
      localStorage.setItem('uyir_auth', 'test-token');

      logout();

      expect(localStorage.getItem('uyir_auth')).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('returns true when user has the role', () => {
      const user = { role: 'ADMIN' };
      expect(hasRole(user, 'ADMIN')).toBe(true);
    });

    it('returns false when user does not have the role', () => {
      const user = { role: 'USER' };
      expect(hasRole(user, 'ADMIN')).toBe(false);
    });

    it('returns true when user has any of the required roles', () => {
      const user = { role: 'INSTRUCTOR' };
      expect(hasRole(user, ['ADMIN', 'INSTRUCTOR'])).toBe(true);
    });

    it('returns false when user is null', () => {
      expect(hasRole(null, 'ADMIN')).toBe(false);
    });
  });
});
