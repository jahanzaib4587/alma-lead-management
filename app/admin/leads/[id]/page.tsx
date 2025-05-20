"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchLeadById, updateLeadStatus } from "../../../store/leadSlice";
import { AuthCheck } from "../../../components/AuthCheck";
import Link from "next/link";
import { LeadStatus } from "../../../types";
import { mapStatusToDisplay } from "../../../utils/statusMapper";

interface LeadPageProps {
  params: {
    id: string;
  };
}

export default function LeadDetailPage({ params }: LeadPageProps) {
  const { id } = params;
  const dispatch = useAppDispatch();
  const { lead, status } = useAppSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadById(id));
  }, [dispatch, id]);

  const handleStatusChange = async () => {
    if (!lead) return;
    
    const newStatus = lead.status === LeadStatus.PENDING 
      ? LeadStatus.REACHED_OUT 
      : LeadStatus.PENDING;
    
    await dispatch(updateLeadStatus({ id: lead.id, status: newStatus }));
  };

  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#11b981]"></div>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  if (!lead) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-xl font-semibold mb-4">Lead Not Found</h1>
              <p className="text-gray-600 mb-4">The lead you&apos;re looking for could not be found.</p>
              <Link 
                href="/admin" 
                className="text-[#11b981] hover:underline"
              >
                &larr; Back to leads
              </Link>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  // Helper function to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return (
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8.5 10.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1z" />
          <path d="M7.5 12.75a.75.75 0 011.5 0v2.5a.75.75 0 01-1.5 0v-2.5z" />
          <path d="M11.5 10.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1z" />
          <path d="M10.5 12.75a.75.75 0 011.5 0v2.5a.75.75 0 01-1.5 0v-2.5z" />
        </svg>
      );
    } else if (fileType.includes("word") || fileType.includes("doc")) {
      return (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M8 13a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        </svg>
      );
    } else if (fileType.includes("image") || fileType.includes("jpg") || fileType.includes("jpeg") || fileType.includes("png")) {
      return (
        <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          <path d="M5.5 16L7 14.5 9 16.5 13 12.5 16.5 16" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  // Helper function to format file size
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} bytes`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Link 
            href="/admin" 
            className="text-[#11b981] hover:underline inline-block mb-4"
          >
            &larr; Back to leads
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-semibold">{lead.first_name} {lead.last_name}</h1>
                  <p className="text-gray-500">{lead.email}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 inline-block rounded-sm text-sm ${
                    lead.status === LeadStatus.PENDING 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {mapStatusToDisplay(lead.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-medium mb-4 text-gray-900">Lead Information</h2>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">LinkedIn Profile</div>
                    <div>
                      <a 
                        href={lead.linked_in_profile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {lead.linked_in_profile}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Submitted At</div>
                    <div>{lead.submitted_at ? new Date(lead.submitted_at).toLocaleString() : ''}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Country</div>
                    <div>{lead.country || "Not specified"}</div>
                  </div>
                  
                  {lead.education && (
                    <div>
                      <div className="text-sm text-gray-500">Education</div>
                      <div>{lead.education}</div>
                    </div>
                  )}
                  
                  {typeof lead.work_experience === 'number' && (
                    <div>
                      <div className="text-sm text-gray-500">Work Experience</div>
                      <div>{lead.work_experience} years</div>
                    </div>
                  )}
                  
                  {lead.current_employer && (
                    <div>
                      <div className="text-sm text-gray-500">Current Employer</div>
                      <div>{lead.current_employer}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="font-medium mb-4 text-gray-900">Visas of Interest</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {lead.visas_of_interest?.map((visa, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                    >
                      {visa}
                    </span>
                  ))}
                </div>
                
                {/* Uploaded Files Section */}
                {lead.files && lead.files.length > 0 && (
                  <div className="mt-6">
                    <h2 className="font-medium mb-4 text-gray-900">Uploaded Documents</h2>
                    <div className="space-y-2">
                      {lead.files.map((file, index) => (
                        <div key={index} className="flex items-center p-3 border border-gray-200 rounded">
                          <div className="mr-3">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium text-sm">{file.name}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                          </div>
                          {file.url && (
                            <a 
                              href={file.url}
                              download={file.name}
                              className="ml-2 p-1 text-gray-500 hover:text-gray-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {lead.additional_information && (
                  <>
                    <h2 className="font-medium mb-2 text-gray-900 mt-6">Additional Information</h2>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="whitespace-pre-wrap">{lead.additional_information}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-[#11b981] text-white rounded hover:bg-[#0e9d6e]"
              >
                {lead.status === LeadStatus.PENDING
                  ? `Mark as ${mapStatusToDisplay(LeadStatus.REACHED_OUT)}`
                  : `Mark as ${mapStatusToDisplay(LeadStatus.PENDING)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 