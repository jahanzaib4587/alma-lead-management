"use client";

import React, { useState, useEffect } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { JsonSchema, UISchemaElement, JsonFormsCore, Layout } from '@jsonforms/core';
import useMediaQuery from '@mui/material/useMediaQuery';

// Create a custom responsive theme
let theme = createTheme({
  palette: {
    primary: {
      main: '#11b981',
    },
    secondary: {
      main: '#f8ffd9',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          padding: '10px 16px',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          width: '100%',
          marginBottom: '16px',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.95rem',
          marginBottom: '4px',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '1rem',
          padding: '10px 14px',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '10px 14px',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: '8px',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          fontSize: '0.75rem',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

interface SchemaFormProps {
  schema: JsonSchema;
  uiSchema: UISchemaElement;
  initialData: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitButtonText?: string;
}

// Type guard to check if an object is a Layout
function isLayout(obj: UISchemaElement): obj is Layout {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    ('type' in obj) && 
    (obj.type === 'HorizontalLayout' || obj.type === 'VerticalLayout') &&
    ('elements' in obj) && 
    Array.isArray((obj as Layout).elements)
  );
}

// Extended layout type that's safer to use
interface ExtendedLayout extends UISchemaElement {
  type: 'HorizontalLayout' | 'VerticalLayout';
  elements: UISchemaElement[];
}

const SchemaForm: React.FC<SchemaFormProps> = ({
  schema,
  uiSchema,
  initialData,
  onSubmit,
  submitButtonText = 'Submit'
}): React.ReactElement => {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [adaptedUiSchema, setAdaptedUiSchema] = useState<UISchemaElement>(uiSchema);

  // Adapt UI schema based on screen size
  useEffect(() => {
    if (isMobile) {
      // Convert horizontal layouts to vertical on mobile
      const adaptMobileLayout = (schema: UISchemaElement): UISchemaElement => {
        if (isLayout(schema) && schema.type === 'HorizontalLayout') {
          // Create vertical layout with the same elements
          const verticalLayout: ExtendedLayout = {
            type: 'VerticalLayout',
            elements: [...schema.elements]
          };
          return verticalLayout;
        }
        
        if (isLayout(schema)) {
          // Process nested elements recursively
          const updatedLayout: ExtendedLayout = {
            ...schema,
            // Ensure the type is explicitly one of the allowed values
            type: schema.type as 'HorizontalLayout' | 'VerticalLayout',
            elements: schema.elements.map(adaptMobileLayout)
          };
          return updatedLayout;
        }
        
        return schema;
      };
      
      setAdaptedUiSchema(adaptMobileLayout(uiSchema));
    } else {
      setAdaptedUiSchema(uiSchema);
    }
  }, [isMobile, uiSchema]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setFormData(initialData);
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (state: Pick<JsonFormsCore, 'data' | 'errors'>): void => {
    setFormData(state.data);
    setErrors(Array.isArray(state.errors) && state.errors.length > 0);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        {submitSuccess && (
          <Alert severity="success" className="mb-4">
            Your information has been submitted successfully!
          </Alert>
        )}
        
        {submitError && (
          <Alert severity="error" className="mb-4">
            {submitError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <JsonForms
              schema={schema}
              uischema={adaptedUiSchema}
              data={formData}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={handleChange}
              config={{
                showUnfocusedDescription: false,
                hideRequiredAsterisk: false,
                restrict: true
              }}
            />
          </div>
          
          <div className="mt-6">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting || errors}
              className="w-full sm:w-auto"
              size={isMobile ? "large" : "medium"}
              fullWidth={isMobile}
            >
              {isSubmitting ? 'Submitting...' : submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </ThemeProvider>
  );
};

export default SchemaForm; 