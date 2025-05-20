import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubmissionPage from './page';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './store/leadSlice';

// Mock the SchemaForm component
jest.mock('./components/SchemaForm', () => {
  const MockSchemaForm = (props: any) => {
    return (
      <div data-testid="schema-form">
        <button 
          data-testid="submit-form-button" 
          onClick={() => props.onSubmit({ 
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            linkedInProfile: 'https://linkedin.com/in/testuser',
            visasOfInterest: ['H-1B']
          })}
        >
          {props.submitButtonText}
        </button>
      </div>
    );
  };
  
  MockSchemaForm.displayName = 'MockSchemaForm';
  return MockSchemaForm;
});

// Mock Redux hooks
jest.mock('./store/hooks', () => ({
  useAppDispatch: () => jest.fn().mockResolvedValue({ type: 'MOCK_ACTION' }),
  useAppSelector: jest.fn()
}));

describe('SubmissionPage', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        leads: leadReducer
      }
    });
  });
  
  it('renders the submission form', () => {
    render(
      <Provider store={store}>
        <SubmissionPage />
      </Provider>
    );
    
    // Check if page title is displayed
    expect(screen.getByText('Immigration Assessment Form')).toBeInTheDocument();
    
    // Check if form is rendered
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
    
    // Check if submit button is present
    expect(screen.getByTestId('submit-form-button')).toBeInTheDocument();
    expect(screen.getByText('Submit Assessment')).toBeInTheDocument();
  });
  
  it('shows success message after form submission', async () => {
    render(
      <Provider store={store}>
        <SubmissionPage />
      </Provider>
    );
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-form-button'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument();
      expect(screen.getByText(/Your information was submitted/)).toBeInTheDocument();
    });
  });
  
  it('allows submitting a new form after success', async () => {
    render(
      <Provider store={store}>
        <SubmissionPage />
      </Provider>
    );
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-form-button'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument();
    });
    
    // Click "Submit Another Assessment" button
    fireEvent.click(screen.getByText('Submit Another Assessment'));
    
    // Check if form is displayed again
    expect(screen.getByTestId('schema-form')).toBeInTheDocument();
  });
  
  it('displays the footer with copyright information', () => {
    render(
      <Provider store={store}>
        <SubmissionPage />
      </Provider>
    );
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Check if footer displays the copyright text with current year
    expect(screen.getByText(new RegExp(`© ${currentYear} almã Immigration Services`))).toBeInTheDocument();
  });
}); 