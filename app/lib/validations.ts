import { z } from "zod";
import { visaTypes } from "../types";

export const leadFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  linkedInProfile: z
    .string()
    .url("LinkedIn profile must be a valid URL")
    .includes("linkedin.com", {
      message: "Must be a LinkedIn URL",
    }),
  visasOfInterest: z
    .array(z.enum(visaTypes))
    .min(1, "Select at least one visa type"),
  resume: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Resume file is required")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size should be less than 5MB"
    )
    .refine(
      (file) => {
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        return validTypes.includes(file.type);
      },
      "Only PDF, DOC and DOCX files are accepted"
    ),
  additionalInfo: z.string().optional(),
}); 