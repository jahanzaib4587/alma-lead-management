// Enum for lead status
export enum LeadStatus {
  PENDING = 'PENDING',
  REACHED_OUT = 'REACHED_OUT'
}

// Define visa types as an array of string literals
export const visaTypes = [
  "H-1B",
  "L-1",
  "O-1",
  "EB-1",
  "EB-2 NIW",
  "EB-2 PERM",
  "EB-3"
] as const;

// String literal type for visa categories
export type VisaType = typeof visaTypes[number];

// File upload type
export interface FileUpload {
  name: string;
  type: string;
  size: number;
  url?: string;
}

// Lead data structure
export interface Lead {
  id: string;
  // camelCase for legacy code
  firstName?: string;
  lastName?: string;
  linkedInProfile?: string;
  workExperience?: number;
  currentEmployer?: string;
  additionalInformation?: string;
  visasOfInterest?: string[];
  submittedAt?: string;
  // snake_case for Supabase
  first_name?: string;
  last_name?: string;
  linked_in_profile?: string;
  work_experience?: number;
  current_employer?: string;
  additional_information?: string;
  visas_of_interest?: string[];
  submitted_at?: string;
  email: string;
  country?: string;
  education?: string;
  files?: FileUpload[] | null;
  status: LeadStatus;
}

// Data structure for lead form submissions
export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  linkedInProfile: string;
  visasOfInterest: string[];
  country?: string;
  education?: string;
  workExperience?: number;
  currentEmployer?: string;
  additionalInformation?: string;
  files?: FileUpload[];
}

// Redux store type
type AppStore = unknown;

// Hook types for Redux
export interface UseAppDispatchOptions {
  store?: AppStore;
}

export interface UseAppSelectorOptions {
  store?: AppStore;
} 