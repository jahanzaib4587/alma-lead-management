import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionProvider } from './SessionProvider';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

// Mock next-auth/react SessionProvider
jest.mock('next-auth/react', () => ({
  SessionProvider: jest.fn(({ children }) => <div data-testid="mocked-session-provider">{children}</div>)
}));

describe('SessionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders children and passes session data to NextAuth SessionProvider', () => {
    const mockSession = { 
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' as const },
      expires: '2023-01-01T00:00:00.000Z'
    };
    
    const { getByTestId, getByText } = render(
      <SessionProvider session={mockSession}>
        <div>Test Child</div>
      </SessionProvider>
    );
    
    // Check if NextAuth SessionProvider was called with the session
    expect(NextAuthSessionProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        session: mockSession
      }),
      expect.anything()
    );
    
    // Check if children are rendered
    expect(getByTestId('mocked-session-provider')).toBeInTheDocument();
    expect(getByText('Test Child')).toBeInTheDocument();
  });
  
  it('handles null session correctly', () => {
    const { getByTestId, getByText } = render(
      <SessionProvider session={null}>
        <div>Test Child</div>
      </SessionProvider>
    );
    
    // Check if NextAuth SessionProvider was called with null session
    expect(NextAuthSessionProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        session: null
      }),
      expect.anything()
    );
    
    // Check if children are rendered
    expect(getByTestId('mocked-session-provider')).toBeInTheDocument();
    expect(getByText('Test Child')).toBeInTheDocument();
  });
}); 