import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssessmentForm from './page';

// Create minimal mocks to allow the component to render
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(name => ({ id: name, name })),
    handleSubmit: jest.fn(cb => jest.fn()),
    formState: { errors: {}, isSubmitted: false },
    setValue: jest.fn()
  }),
  useController: () => ({
    field: { value: '', onChange: jest.fn() }
  })
}));

jest.mock('./store/hooks', () => ({
  useAppDispatch: () => jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '1234-5678-9101')
}));

jest.mock('./store/leadSlice', () => ({
  addLead: jest.fn(),
  submitAssessment: jest.fn()
}));

describe('AssessmentForm', () => {
  it('renders basic page elements', () => {
    // Use a spy console to suppress expected errors
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(<AssessmentForm />);
    
    // Check for form fields using labels
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    
    // Restore original console.error
    console.error = originalConsoleError;
  });
}); 