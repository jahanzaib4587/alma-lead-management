"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from './store/hooks';
import { addLead, submitAssessment } from './store/leadSlice';
import { v4 as uuidv4 } from 'uuid';
import { Lead, LeadStatus } from './types';
import Link from 'next/link';

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(2, 'Country is required'),
  linkedInProfile: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  visasOfInterest: z.array(z.string()).min(1, 'Select at least one visa category'),
  additionalInformation: z.string().min(10, 'Please provide more details about your situation'),
});

type FormData = z.infer<typeof formSchema>;

export default function AssessmentForm() {
  const [formStep, setFormStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  
  // Track selected visas separately for more reliable state management
  const [selectedVisas, setSelectedVisas] = useState<string[]>([]);
  
  // Redux dispatch
  const dispatch = useAppDispatch();

  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitted },
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      linkedInProfile: "",
      additionalInformation: "",
      visasOfInterest: []
    }
  });

  // Update the form with selected visas anytime they change
  useEffect(() => {
    setValue('visasOfInterest', selectedVisas, { shouldValidate: true });
  }, [selectedVisas, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate file size (5MB max per file)
      const invalidFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
      
      if (invalidFiles.length > 0) {
        setFileUploadError("Some files exceed the 5MB size limit");
        return;
      }
      
      // Limit to maximum 3 files
      if (filesArray.length + selectedFiles.length > 3) {
        setFileUploadError("Maximum 3 files allowed");
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      
      // Log the data being submitted
      console.log('Submitting assessment form data:', { ...data });
      
      // Create a FormData object to send files and form data
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });
      
      // Add files
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`file${index}`, file);
      });
      
      // Submit assessment using Redux
      const result = await dispatch(submitAssessment(formDataToSend)).unwrap();
      
      // Show success state
      setFormStep("success");
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmissionError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle visa selection
  const handleVisaChange = (visaType: string) => {
    setSelectedVisas(prevSelected => {
      const isAlreadySelected = prevSelected.includes(visaType);
      
      if (isAlreadySelected) {
        return prevSelected.filter(v => v !== visaType);
      } else {
        return [...prevSelected, visaType];
      }
    });
  };

  if (formStep === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-xl shadow-md px-8 py-12 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            {/* 3D document icon */}
            <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-black mb-2">Thank You</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your information was submitted to our team of immigration attorneys.<br />
            Expect an email from <strong>hello@tryalma.ai</strong>.
          </p>
          
          <button 
            onClick={() => setFormStep("form")}
            className="mt-8 px-6 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-900 transition"
          >
            Go Back to Homepage
          </button>
        </div>
        
        {/* Admin Floating Button */}
        <div className="fixed bottom-8 right-8 group z-50">
          <Link href="/login" className="bg-gray-800 hover:bg-black text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-gray-900 text-white text-sm rounded py-1 px-2 whitespace-nowrap">
              Admin Login
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16 w-full relative">
      {/* Hero Section */}
      <div className="bg-[#DCE4B1] py-12 text-center rounded-t-lg relative overflow-hidden">
        {/* Decorative SVGs */}
        <div className="absolute left-0 bottom-0">
          <div className="w-36 h-36 rounded-full bg-[#c5d48a] absolute -bottom-12 -left-16"></div>
          <div className="w-32 h-32 rounded-full bg-[#d0dd9c] absolute -bottom-6 -left-6"></div>
          <div className="w-38 h-38 rounded-full bg-[#e3ebb8] absolute bottom-4 -left-10"></div>
        </div>
        <div className="relative z-10">
          <div className="text-xl font-bold ml-4">almã</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black leading-tight mt-4">
            Get An Assessment<br />
            Of Your Immigration Case
          </h1>
        </div>
      </div>
      
      {/* Form content */}
      <div className="bg-white p-10 shadow-md rounded-b-lg">
        <div className="space-y-10">
          {/* Introduction */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 5H5V19H19V5Z" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 10V16M9 13H15" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <h2 className="text-center font-semibold text-lg mb-3">Want to understand your visa options?</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Submit the form below and our team of experienced attorneys will
              review your information and send a preliminary assessment of your
              case based on your goals.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Global error summary */}
            {isSubmitted && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 text-red-700 border border-red-300 p-3 rounded mb-6">
                Please correct the highlighted fields below.
              </div>
            )}

            {submissionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                {submissionError}
              </div>
            )}
            
            {/* Personal Information */}
            <div className="space-y-5">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium mb-1 block">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  {...register("firstName")}
                  placeholder="First Name"
                  className={`w-full border ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 shadow-sm placeholder:text-gray-400`}
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="text-sm font-medium mb-1 block">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Last Name"
                  className={`w-full border ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 shadow-sm placeholder:text-gray-400`}
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1 block">Email Address</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  placeholder="Email"
                  className={`w-full border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 shadow-sm placeholder:text-gray-400`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="country" className="text-sm font-medium mb-1 block">Country of Citizenship</label>
                <select
                  id="country"
                  {...register("country")}
                  className={`w-full border ${errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 shadow-sm appearance-none bg-white pr-8`}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>Country of Citizenship</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="Albania">Albania</option>
                  <option value="Algeria">Algeria</option>
                  <option value="India">India</option>
                  <option value="China">China</option>
                  <option value="Brazil">Brazil</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Other">Other</option>
                </select>
                {errors.country && (
                  <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="linkedInProfile" className="text-sm font-medium mb-1 block">LinkedIn / Personal Website</label>
                <input
                  type="url"
                  id="linkedInProfile"
                  {...register("linkedInProfile")}
                  placeholder="LinkedIn / Personal Website URL"
                  className={`w-full border ${errors.linkedInProfile ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 shadow-sm placeholder:text-gray-400`}
                  disabled={isSubmitting}
                />
                {errors.linkedInProfile && (
                  <p className="text-sm text-red-600 mt-1">{errors.linkedInProfile.message}</p>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center">
                  <svg width="24" height="24" className="text-2xl" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-center text-lg font-semibold mb-3">Upload Supporting Documents</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-4 leading-relaxed">
                Share your resume or any relevant documents to help us understand your case better.
                <br />
                Maximum 3 files, 5MB each.
              </p>
              
              <div className="border border-dashed border-gray-300 p-6 rounded-lg bg-gray-50 text-center relative">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={isSubmitting}
                />
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-semibold">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, JPG, JPEG, PNG
                  </p>
                </div>
              </div>
              
              {fileUploadError && (
                <div className="text-red-500 text-sm mt-2">
                  {fileUploadError}
                </div>
              )}
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files:
                  </h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded transition-all duration-300 ease-in-out">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visa categories section */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 16V4H4V16H20Z" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 20H22" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 12H16" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 8H16" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 12H8.01" stroke="#6b7df3" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-center text-lg font-semibold mb-4">Visa categories of interest?</h3>
              
              <div className="flex flex-col gap-3 text-sm max-w-sm mx-auto">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="O-1"
                    checked={selectedVisas.includes("O-1")}
                    onChange={() => handleVisaChange("O-1")}
                    className="h-4 w-4 accent-black border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="O-1" className="ml-2 block text-sm text-gray-700">
                    O-1
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="EB-1A"
                    checked={selectedVisas.includes("EB-1")}
                    onChange={() => handleVisaChange("EB-1")}
                    className="h-4 w-4 accent-black border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="EB-1A" className="ml-2 block text-sm text-gray-700">
                    EB-1A
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="EB-2-NIW"
                    checked={selectedVisas.includes("EB-2 NIW")}
                    onChange={() => handleVisaChange("EB-2 NIW")}
                    className="h-4 w-4 accent-black border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="EB-2-NIW" className="ml-2 block text-sm text-gray-700">
                    EB-2 NIW
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dontKnow"
                    checked={selectedVisas.includes("I don&apos;t know")}
                    onChange={() => handleVisaChange("I don&apos;t know")}
                    className="h-4 w-4 accent-black border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="dontKnow" className="ml-2 block text-sm text-gray-700">
                    I don&apos;t know
                  </label>
                </div>
              </div>
              
              {errors.visasOfInterest && (
                <p className="text-sm text-red-600 mt-1">{errors.visasOfInterest.message}</p>
              )}
            </div>

            {/* Additional information */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-md flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#9370DB" strokeWidth="1.5" />
                    <path d="M12 12V16M12 8V8.01" stroke="#9370DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-center text-lg font-semibold mb-4">How can we help you?</h3>
              <textarea
                {...register("additionalInformation")}
                placeholder="What is your current status and when does it expire?
What is your past immigration history?
Are you looking for long-term permanent residence or short-term employment visa or both?
Any timeline considerations?"
                className={`w-full min-h-[120px] border ${errors.additionalInformation ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-3 text-sm shadow-sm placeholder:text-gray-400`}
                disabled={isSubmitting}
              ></textarea>
              {errors.additionalInformation && (
                <p className="text-sm text-red-600 mt-1">{errors.additionalInformation.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition relative"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="opacity-0">Submit</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Admin Floating Button */}
      <div className="fixed bottom-8 right-8 group z-50">
        <Link href="/login" className="bg-gray-800 hover:bg-black text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-gray-900 text-white text-sm rounded py-1 px-2 whitespace-nowrap">
            Admin Login
          </div>
        </div>
      </div>
    </div>
  );
}
