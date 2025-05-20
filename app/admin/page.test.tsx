import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPage from './page';
import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { configureStore, AnyAction } from '@reduxjs/toolkit';
import { Store } from 'redux';

// Define the state type
interface LeadState {
  leads: any[];
  status: string;
}

// Create a mock reducer function for leads
const mockLeadReducer = (state: LeadState = { leads: [], status: 'idle' }, action: AnyAction): LeadState => state;

// Mock the useSession hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ 
    status: 'authenticated',
    data: { user: { name: 'Test Admin', email: 'admin@example.com' } }
  })),
  signOut: jest.fn(() => Promise.resolve(true)),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ 
    replace: jest.fn(),
    push: jest.fn()
  }))
}));

// Mock Redux hooks and dispatch
jest.mock('../store/hooks', () => ({
  useAppDispatch: () => jest.fn(() => Promise.resolve()),
  useAppSelector: jest.fn(() => ({
    leads: [],
    status: 'idle'
  }))
}));

describe('AdminPage', () => {
  let store: Store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        leads: mockLeadReducer
      }
    });
    
    // Reset any mocks
    jest.clearAllMocks();
  });

  it('renders the admin dashboard when authenticated', () => {
    render(
      <Provider store={store}>
        <SessionProvider>
          <AdminPage />
        </SessionProvider>
      </Provider>
    );
    
    // Check if the page title heading is in the document
    expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
    
    // Check if sidebar elements are present
    expect(screen.getByText('almã')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check if admin user section is shown
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
}); 