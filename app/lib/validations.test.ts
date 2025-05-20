import { leadFormSchema } from './validations';

// Mock the VisaType enum used in the validation schema
// This addresses the "Cannot convert undefined or null to object" error
jest.mock('../types', () => ({
  VisaType: {
    'H-1B': 'H-1B',
    'L-1': 'L-1',
    'O-1': 'O-1',
    'EB-1': 'EB-1',
    'EB-2 NIW': 'EB-2 NIW',
    'EB-2 PERM': 'EB-2 PERM',
    'EB-3': 'EB-3'
  }
}));

describe('leadFormSchema', () => {
  // Helper function to create a valid lead form data object
  const createValidLeadData = () => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    linkedInProfile: 'https://linkedin.com/in/johndoe',
    visasOfInterest: ['H-1B'], // Using string directly instead of visaTypes array
    resume: new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' }),
    additionalInfo: 'Some additional information'
  });

  it('validates a correct lead form data', () => {
    const validData = createValidLeadData();
    const result = leadFormSchema.safeParse(validData);
    
    expect(result.success).toBe(true);
  });

  it('validates firstName is required', () => {
    const invalidData = createValidLeadData();
    invalidData.firstName = '';
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.firstName?._errors).toContain('First name is required');
    }
  });

  it('validates lastName is required', () => {
    const invalidData = createValidLeadData();
    invalidData.lastName = '';
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.lastName?._errors).toContain('Last name is required');
    }
  });

  it('validates email format', () => {
    const invalidData = createValidLeadData();
    invalidData.email = 'invalid-email';
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.email?._errors).toContain('Invalid email address');
    }
  });

  it('validates linkedInProfile is a valid LinkedIn URL', () => {
    const invalidData = createValidLeadData();
    invalidData.linkedInProfile = 'https://example.com';
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.linkedInProfile?._errors).toContain('Must be a LinkedIn URL');
    }
  });

  it('validates at least one visaOfInterest is selected', () => {
    const invalidData = createValidLeadData();
    invalidData.visasOfInterest = [];
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.visasOfInterest?._errors).toContain('Select at least one visa type');
    }
  });

  it('validates resume is a valid file type', () => {
    const invalidData = createValidLeadData();
    invalidData.resume = new File(['dummy content'], 'resume.txt', { type: 'text/plain' });
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.resume?._errors).toContain('Only PDF, DOC and DOCX files are accepted');
    }
  });

  it('validates resume file size is within limits', () => {
    // Create a mock file with size larger than 5MB
    const largeArrayBuffer = new ArrayBuffer(6 * 1024 * 1024); // 6MB
    const largeFile = new File([largeArrayBuffer], 'large_resume.pdf', { type: 'application/pdf' });
    
    const invalidData = createValidLeadData();
    invalidData.resume = largeFile;
    
    const result = leadFormSchema.safeParse(invalidData);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.resume?._errors).toContain('File size should be less than 5MB');
    }
  });

  it('allows optional additionalInfo field', () => {
    // Create data without additionalInfo directly
    const dataWithoutAdditionalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      linkedInProfile: 'https://linkedin.com/in/johndoe',
      visasOfInterest: ['H-1B'],
      resume: new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' })
      // additionalInfo is intentionally omitted
    };
    
    const result = leadFormSchema.safeParse(dataWithoutAdditionalInfo);
    
    expect(result.success).toBe(true);
  });
}); 