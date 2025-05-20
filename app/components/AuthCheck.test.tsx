import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthCheck } from './AuthCheck';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AuthCheck', () => {
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
  });
  
  it('renders loading state when session status is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'loading',
    });
    
    render(<AuthCheck>Protected Content</AuthCheck>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('renders nothing and redirects when user is unauthenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'unauthenticated',
    });
    
    render(<AuthCheck>Protected Content</AuthCheck>);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('renders children when user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
    });
    
    render(<AuthCheck>Protected Content</AuthCheck>);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
}); 