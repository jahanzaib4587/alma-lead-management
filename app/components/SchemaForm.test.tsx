import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the @mui/material dependencies
jest.mock('@mui/material/styles', () => ({
  createTheme: jest.fn(() => ({})),
  ThemeProvider: Object.assign(({ children }: { children: React.ReactNode }) => <div>{children}</div>, { displayName: 'ThemeProvider' })
}));

jest.mock('@mui/material/Button', () => Object.assign((props: any) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    data-testid="submit-button"
  >
    {props.children}
  </button>
), { displayName: 'Button' }));

jest.mock('@mui/material/Alert', () => Object.assign((props: any) => (
  <div data-testid={`alert-${props.severity}`}>{props.children}</div>
), { displayName: 'Alert' }));

// Mock the JsonForms dependencies
jest.mock('@jsonforms/react', () => ({
  JsonForms: Object.assign((props: any) => {
    // Simulate the onChange being called when data changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.name;
      const value = e.target.value;
      const newData = { ...props.data, [name]: value };
      props.onChange({ data: newData, errors: [] });
    };

    return (
      <div data-testid="json-forms">
        {Object.keys(props.schema.properties).map(propKey => (
          <div key={propKey}>
            <label htmlFor={propKey}>{props.schema.properties[propKey].title}</label>
            <input
              id={propKey}
              name={propKey}
              data-testid={`input-${propKey}`}
              onChange={handleChange}
              value={props.data[propKey] || ''}
            />
          </div>
        ))}
      </div>
    );
  }, { displayName: 'JsonForms' })
}));

jest.mock('@jsonforms/material-renderers', () => ({
  materialRenderers: [],
  materialCells: []
}));

// Import SchemaForm after mocking its dependencies
import SchemaForm from './SchemaForm';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

describe('SchemaForm', () => {
  // Test schema
  const testSchema: JsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Name'
      },
      email: {
        type: 'string',
        title: 'Email',
        format: 'email'
      }
    },
    required: ['name', 'email']
  };

  const testUiSchema: UISchemaElement = {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        scope: '#/properties/name'
      },
      {
        type: 'Control',
        scope: '#/properties/email'
      }
    ]
  };

  const initialData = {
    name: '',
    email: ''
  };

  it('renders the form with schema-defined fields', () => {
    const handleSubmit = jest.fn();
    
    render(
      <SchemaForm
        schema={testSchema}
        uiSchema={testUiSchema}
        initialData={initialData}
        onSubmit={handleSubmit}
        submitButtonText="Submit Test"
      />
    );

    expect(screen.getByTestId('json-forms')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText('Submit Test')).toBeInTheDocument();
  });

  it('submits the form with entered data', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(
      <SchemaForm
        schema={testSchema}
        uiSchema={testUiSchema}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    );
    
    // Fill the form
    fireEvent.change(screen.getByTestId('input-name'), { 
      target: { name: 'name', value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByTestId('input-email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });

  it('displays success message after successful submission', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(
      <SchemaForm
        schema={testSchema}
        uiSchema={testUiSchema}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    );
    
    // Fill and submit the form
    fireEvent.change(screen.getByTestId('input-name'), { 
      target: { name: 'name', value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByTestId('input-email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });
  });

  it('displays error message when submission fails', async () => {
    const errorMsg = 'Submission failed';
    const handleSubmit = jest.fn().mockRejectedValue(new Error(errorMsg));
    
    render(
      <SchemaForm
        schema={testSchema}
        uiSchema={testUiSchema}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    );
    
    // Fill and submit the form
    fireEvent.change(screen.getByTestId('input-name'), { 
      target: { name: 'name', value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByTestId('input-email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(
      <SchemaForm
        schema={testSchema}
        uiSchema={testUiSchema}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    );
    
    // Fill the form
    fireEvent.change(screen.getByTestId('input-name'), { 
      target: { name: 'name', value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByTestId('input-email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if form was reset
    await waitFor(() => {
      const nameInput = screen.getByTestId('input-name');
      const emailInput = screen.getByTestId('input-email');
      
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    });
  });
}); 