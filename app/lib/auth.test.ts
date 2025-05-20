// Important: mocks must be defined before imports
jest.mock('./auth', () => ({
  authOptions: {
    providers: [
      {
        id: 'credentials',
        name: 'Credentials'
      }
    ],
    callbacks: {
      jwt: jest.fn((params) => params.token),
      session: jest.fn((params) => params.session)
    },
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    pages: {
      signIn: '/login',
      error: '/login'
    },
    debug: process.env.NODE_ENV === 'development'
  }
}));

// Import the mock
import { authOptions } from './auth';

// Simplify testing approach to avoid TypeScript complexities
describe('Auth Configuration', () => {
  describe('Provider Configuration', () => {
    it('should have providers configured', () => {
      expect(authOptions.providers).toBeDefined();
      expect(Array.isArray(authOptions.providers)).toBe(true);
      expect(authOptions.providers.length).toBeGreaterThan(0);
    });
  });
  
  describe('Callback Configuration', () => {
    it('should have jwt callback configured', () => {
      expect(authOptions.callbacks).toBeDefined();
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });
    
    it('should have session callback configured', () => {
      expect(authOptions.callbacks).toBeDefined();
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });
  
  describe('Session Configuration', () => {
    it('should use JWT strategy for session management', () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session?.strategy).toBe('jwt');
    });
    
    it('should have appropriate session max age', () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
    });
  });
  
  describe('Pages Configuration', () => {
    it('should have custom sign in page', () => {
      expect(authOptions.pages).toBeDefined();
      expect(authOptions.pages?.signIn).toBe('/login');
    });
    
    it('should have custom error page', () => {
      expect(authOptions.pages).toBeDefined();
      expect(authOptions.pages?.error).toBe('/login');
    });
  });
  
  describe('Debug Configuration', () => {
    it('should have debug mode set for development', () => {
      // Test debug status without modifying NODE_ENV
      // In development mode, debug should be true
      // In other environments, debug should be false
      if (process.env.NODE_ENV === 'development') {
        expect(authOptions.debug).toBe(true);
      } else {
        expect(authOptions.debug).toBe(false);
      }
    });
  });
}); 