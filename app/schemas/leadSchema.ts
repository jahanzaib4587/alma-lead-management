import { JsonSchema, UISchemaElement } from '@jsonforms/core';

// Define visa types
export type VisaType = 'H-1B' | 'L-1' | 'O-1' | 'EB-1' | 'EB-2 NIW' | 'EB-2 PERM' | 'EB-3';

// Define education levels
export type EducationLevel = 'High School' | 'Associate Degree' | 'Bachelor\'s Degree' | 'Master\'s Degree' | 'Doctorate';

// Define the lead data interface
export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  linkedInProfile: string;
  country: string;
  visasOfInterest: VisaType[];
  education: EducationLevel | string;
  workExperience: number;
  currentEmployer: string;
  additionalInformation: string;
}

export const leadSchema: JsonSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      minLength: 1
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      minLength: 1
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email'
    },
    linkedInProfile: {
      type: 'string',
      title: 'LinkedIn Profile URL',
      pattern: '^https://www\\.linkedin\\.com/.*$'
    },
    country: {
      type: 'string',
      title: 'Country'
    },
    visasOfInterest: {
      type: 'array',
      title: 'Visas of Interest',
      items: {
        type: 'string',
        enum: [
          'H-1B',
          'L-1',
          'O-1',
          'EB-1',
          'EB-2 NIW',
          'EB-2 PERM',
          'EB-3'
        ]
      },
      uniqueItems: true
    },
    education: {
      type: 'string',
      title: 'Highest Level of Education',
      enum: [
        'High School',
        'Associate Degree',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'Doctorate'
      ]
    },
    workExperience: {
      type: 'number',
      title: 'Years of Work Experience',
      minimum: 0
    },
    currentEmployer: {
      type: 'string',
      title: 'Current Employer (if any)'
    },
    additionalInformation: {
      type: 'string',
      title: 'Additional Information',
      description: 'Any other details you would like us to know'
    }
  },
  required: ['firstName', 'lastName', 'email', 'visasOfInterest']
};

// Using type assertion to satisfy TypeScript
export const leadUiSchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName'
        },
        {
          type: 'Control',
          scope: '#/properties/lastName'
        }
      ]
    },
    {
      type: 'Control',
      scope: '#/properties/email'
    },
    {
      type: 'Control',
      scope: '#/properties/linkedInProfile'
    },
    {
      type: 'Control',
      scope: '#/properties/country'
    },
    {
      type: 'Control',
      scope: '#/properties/visasOfInterest',
      options: {
        multi: true
      }
    },
    {
      type: 'Control',
      scope: '#/properties/education'
    },
    {
      type: 'Control',
      scope: '#/properties/workExperience'
    },
    {
      type: 'Control',
      scope: '#/properties/currentEmployer'
    },
    {
      type: 'Control',
      scope: '#/properties/additionalInformation',
      options: {
        multi: true
      }
    }
  ]
} as UISchemaElement;

export const initialData: LeadData = {
  firstName: '',
  lastName: '',
  email: '',
  linkedInProfile: '',
  country: '',
  visasOfInterest: [],
  education: '',
  workExperience: 0,
  currentEmployer: '',
  additionalInformation: ''
}; 