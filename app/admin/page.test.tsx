import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPage from './page';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import leadReducer, { fetchLeads, updateLeadStatus } from '../store/leadSlice';
import { LeadStatus } from '../types';

// Mock the AuthCheck component
jest.mock('../components/AuthCheck', () => ({
  AuthCheck: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the API service
jest.mock('../services/api', () => ({
  leadService: {
    getLeads: jest.fn(),
    updateLeadStatus: jest.fn()
  }
}));

// Import mocked API
import { leadService } from '../services/api';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  );
});

// Mock the useAppDispatch and useAppSelector hooks
jest.mock('../store/hooks', () => {
  const actual = jest.requireActual('../store/hooks');
  return {
    ...actual,
    // Re-export but with Redux Provider wrapper
    useAppDispatch: () => jest.fn(),
    useAppSelector: jest.fn()
  };
});

import { useAppSelector } from '../store/hooks';

describe('AdminPage', () => {
  let store: ReturnType<typeof configureStore>;
  
  const mockLeads = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      linkedInProfile: 'https://linkedin.com/in/johndoe',
      status: LeadStatus.PENDING,
      submittedAt: new Date().toISOString(),
      visasOfInterest: ['H-1B'],
      country: 'USA'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      linkedInProfile: 'https://linkedin.com/in/janesmith',
      status: LeadStatus.REACHED_OUT,
      submittedAt: new Date().toISOString(),
      visasOfInterest: ['L-1'],
      country: 'Canada'
    }
  ];

  beforeEach(() => {
    // Set up the Redux store
    store = configureStore({
      reducer: {
        leads: leadReducer
      }
    });

    // Mock useAppSelector to return the desired state
    (useAppSelector as jest.Mock).mockImplementation(selector => 
      selector({
        leads: {
          leads: mockLeads,
          status: 'succeeded',
          error: null,
          lead: null
        }
      })
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('displays the leads table when leads are available', () => {
    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Check if company name is displayed
    expect(screen.getByText('almã')).toBeInTheDocument();
    
    // Check if leads are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // Check if countries are displayed
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    
    // Check if statuses are displayed
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Reached Out')).toBeInTheDocument();
  });

  it('shows loading state when fetching leads', () => {
    // Override the mock to simulate loading state
    (useAppSelector as jest.Mock).mockImplementation(selector => 
      selector({
        leads: {
          leads: [],
          status: 'loading',
          error: null,
          lead: null
        }
      })
    );

    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Check if loading spinner is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows empty state when no leads match filter', () => {
    // Override the mock to simulate empty results
    (useAppSelector as jest.Mock).mockImplementation(selector => 
      selector({
        leads: {
          leads: [],
          status: 'succeeded',
          error: null,
          lead: null
        }
      })
    );

    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Check if empty state message is displayed
    expect(screen.getByText('No leads found')).toBeInTheDocument();
  });

  it('allows filtering leads by status', () => {
    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Get the status filter dropdown
    const statusFilter = screen.getByRole('combobox');
    
    // Select "Pending" status
    fireEvent.change(statusFilter, { target: { value: LeadStatus.PENDING } });
    
    // Since we're mocking useAppSelector, we need to manually check that the filter was applied
    expect(statusFilter).toHaveValue(LeadStatus.PENDING);
  });

  it('allows searching leads', () => {
    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Get the search input
    const searchInput = screen.getByPlaceholderText('Search');
    
    // Enter search query
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    // Check if search input value changed
    expect(searchInput).toHaveValue('john');
  });

  it('allows changing lead status', async () => {
    // Mock the dispatch function
    const mockDispatch = jest.fn().mockResolvedValue({ payload: mockLeads[0] });
    require('../store/hooks').useAppDispatch = () => mockDispatch;

    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Find status change button for the first lead
    const statusButton = screen.getByText('Mark as Reached Out');
    
    // Click the button
    fireEvent.click(statusButton);
    
    // Check if dispatch was called with the right action
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('allows exporting leads to CSV', () => {
    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    const mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockLink as any);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    render(
      <Provider store={store}>
        <AdminPage />
      </Provider>
    );

    // Find export button
    const exportButton = screen.getByText('Export CSV');
    
    // Click export button
    fireEvent.click(exportButton);
    
    // Check if CSV download was triggered
    expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'leads.csv');
    expect(mockLink.click).toHaveBeenCalled();
  });
}); 