export enum LeadStatus {
  PENDING = "Pending",
  REACHED_OUT = "Reached Out",
}

export enum VisaType {
  H1B = "H-1B",
  L1 = "L-1",
  O1 = "O-1",
  EB1 = "EB-1",
  EB2_NIW = "EB-2 NIW",
  EB2_PERM = "EB-2 PERM",
  EB3 = "EB-3",
  OTHER = "OTHER",
}

export interface FileUpload {
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  linkedInProfile: string;
  visasOfInterest: VisaType[] | string[];
  status: LeadStatus;
  submittedAt: string;
  country?: string;
  resumeUrl?: string;
  additionalInfo?: string;
  additionalInformation?: string;
  files?: FileUpload[];
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  linkedInProfile: string;
  visasOfInterest: VisaType[];
  resume?: File;
  additionalInfo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  image?: string;
} 