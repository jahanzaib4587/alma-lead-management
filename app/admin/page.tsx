"use client";

import React, { useState, useEffect } from "react";
import { Lead, LeadStatus } from "../types";
import { AuthCheck } from "../components/AuthCheck";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchLeads, deleteLead } from "../store/leadSlice";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { mapStatusToDisplay } from "../utils/statusMapper";
import Link from "next/link";

type SortField = "name" | "submittedAt" | "status" | "country";
type SortDirection = "asc" | "desc";

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { leads, status: loadingStatus } = useAppSelector(state => state.leads);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{field: SortField, direction: SortDirection}>({
    field: "submittedAt",
    direction: "desc"
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  
  const leadsPerPage = 8;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  // Fetch leads when authenticated
  useEffect(() => {
    if (authStatus === "authenticated") {
    dispatch(fetchLeads());
    }
  }, [dispatch, authStatus]);
  
  // Show loading state while authentication is being checked
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11b981] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated
  if (authStatus === "unauthenticated") {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleDeleteClick = (id: string) => {
    setLeadToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete) {
      try {
        await dispatch(deleteLead(leadToDelete)).unwrap();
        // Reset pagination if we're on the last page and it's now empty
        const remainingLeads = filteredLeads.length - 1;
        const newTotalPages = Math.ceil(remainingLeads / leadsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        console.error("Failed to delete lead:", error);
      }
    }
    setIsModalOpen(false);
    setLeadToDelete(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setLeadToDelete(null);
  };

  const sortLeads = (leadsToSort: Lead[]) => {
    return [...leadsToSort].sort((a, b) => {
      let firstValue;
      let secondValue;

      switch (sortConfig.field) {
        case "name":
          firstValue = `${a.first_name} ${a.last_name}`;
          secondValue = `${b.first_name} ${b.last_name}`;
          break;
        case "country":
          firstValue = a.country || "";
          secondValue = b.country || "";
          break;
        case "status":
          firstValue = a.status;
          secondValue = b.status;
          break;
        case "submittedAt":
        default:
          firstValue = new Date(a.submitted_at ?? 0).getTime();
          secondValue = new Date(b.submitted_at ?? 0).getTime();
          break;
      }

      if (sortConfig.direction === "asc") {
        return firstValue > secondValue ? 1 : -1;
      } else {
        return firstValue < secondValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field: SortField) => {
    setSortConfig({
      field,
      direction: 
        sortConfig.field === field && sortConfig.direction === "asc" 
          ? "desc" 
          : "asc"
    });
  };

  // Enhanced search function
  const filterLeads = (leadsToFilter: Lead[]) => {
    return leadsToFilter.filter((lead) => {
      // Status filter
      const matchesStatus = 
        statusFilter === "all" || 
        lead.status === statusFilter;
        
      // Search query filter
      const searchableFields = {
        name: `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.toLowerCase(),
        email: (lead.email ?? "").toLowerCase(),
        country: (lead.country ?? "").toLowerCase(),
        linkedIn: (lead.linked_in_profile ?? "").toLowerCase(),
        visas: Array.isArray(lead.visas_of_interest) ? lead.visas_of_interest.join(" ").toLowerCase() : "",
      };
      
      const matchesSearch = searchQuery === "" || 
        Object.keys(searchableFields).some(key => {
          return searchableFields[key as keyof typeof searchableFields].includes(searchQuery.toLowerCase());
        });
      
      return matchesStatus && matchesSearch;
    });
  };

  // Apply filters and sorting
  const filteredLeads = filterLeads(leads);
  const sortedLeads = sortLeads(filteredLeads);

  // Pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const isLoading = loadingStatus === 'loading';
  
  // Helper function to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <span className="ml-1 text-gray-300">↓</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <AuthCheck>
      <div className="h-screen overflow-hidden flex flex-row bg-white">
        {/* Sidebar */}
        <div className="w-60 h-full bg-gradient-to-br from-[#FCFCD9] to-white border-r border-gray-200 fixed top-0 left-0 flex flex-col">
          <div className="text-2xl font-bold tracking-wide text-black pl-6 py-4">almã</div>
          
          <nav className="mt-6 flex-grow">
            <div className="font-medium border-l-4 border-black bg-white text-black font-semibold px-4 py-2">
              <span className="block">Leads</span>
            </div>
            <div className="font-medium text-gray-500 hover:text-black transition-colors px-6 py-2">
              <span className="block">Settings</span>
            </div>
          </nav>
          
          <div className="p-6 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Admin profile info - no longer clickable for logout */}
              <div className="flex items-center text-gray-600">
                <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center mr-3 text-sm font-medium">A</div>
                <span className="font-medium">Admin</span>
              </div>
              
              {/* Dedicated logout button */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-60 h-screen flex flex-col overflow-hidden">
          <div className="p-6 sm:p-10 flex-grow flex flex-col max-h-full overflow-hidden">
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col overflow-hidden">
              <header className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold mb-6">Leads</h1>
                
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="relative w-full max-w-sm">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder:text-gray-400 pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </div>
                    
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 appearance-none pr-8"
                    >
                      <option value="all">Status</option>
                      <option value={LeadStatus.PENDING}>Pending</option>
                      <option value={LeadStatus.REACHED_OUT}>Reached Out</option>
                    </select>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </header>

              {isLoading ? (
                <div className="flex-grow flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11b981]" data-testid="loading-spinner"></div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex-grow flex justify-center items-center text-gray-500">
                  No leads found
                </div>
              ) : (
                <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                  <div className="bg-white shadow-md rounded-xl flex flex-col flex-grow overflow-hidden">
                    <div>
                      <table className="w-full">
                        <colgroup>
                          <col className="w-[25%]" />
                          <col className="w-[25%]" />
                          <col className="w-[20%]" />
                          <col className="w-[15%]" />
                          <col className="w-[15%]" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th
                              className="text-left text-gray-700 text-sm font-semibold bg-gray-100 px-6 py-4 cursor-pointer"
                              onClick={() => handleSort("name")}
                            >
                              <div className="flex items-center">
                                Name
                                {renderSortIndicator("name")}
                              </div>
                            </th>
                            <th
                              className="text-left text-gray-700 text-sm font-semibold bg-gray-100 px-6 py-4 cursor-pointer"
                              onClick={() => handleSort("submittedAt")}
                            >
                              <div className="flex items-center">
                                Submitted
                                {renderSortIndicator("submittedAt")}
                              </div>
                            </th>
                            <th
                              className="text-left text-gray-700 text-sm font-semibold bg-gray-100 px-6 py-4 cursor-pointer"
                              onClick={() => handleSort("status")}
                            >
                              <div className="flex items-center">
                                Status
                                {renderSortIndicator("status")}
                              </div>
                            </th>
                            <th
                              className="text-left text-gray-700 text-sm font-semibold bg-gray-100 px-6 py-4 cursor-pointer"
                              onClick={() => handleSort("country")}
                            >
                              <div className="flex items-center">
                                Country
                                {renderSortIndicator("country")}
                              </div>
                            </th>
                            <th className="text-left text-gray-700 text-sm font-semibold bg-gray-100 px-6 py-4">
                              Actions
                            </th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden flex-grow min-h-0">
                      <table className="w-full">
                        <colgroup>
                          <col className="w-[25%]" />
                          <col className="w-[25%]" />
                          <col className="w-[20%]" />
                          <col className="w-[15%]" />
                          <col className="w-[15%]" />
                        </colgroup>
                        <tbody>
                          {currentLeads.map((lead) => (
                            <tr
                              key={lead.id}
                              className="text-gray-800 text-sm border-t hover:bg-gray-50 transition"
                            >
                              <td className="px-6 py-4">
                                <div className="font-medium">
                                  {lead.first_name} {lead.last_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {lead.submitted_at ?
                                  `${new Date(lead.submitted_at).toLocaleDateString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric"
                                  })}, ${new Date(lead.submitted_at).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}`
                                  : '—'}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={
                                    lead.status === LeadStatus.PENDING
                                      ? "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                                      : "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                                  }
                                >
                                  {mapStatusToDisplay(lead.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {lead.country || "—"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="View lead details"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(lead.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    aria-label="Delete lead"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
              
                    {/* Pagination Controls in footer */}
                    {!isLoading && totalPages > 1 && (
                      <div className="flex justify-end items-center gap-2 px-6 py-4 border-t flex-shrink-0">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-md border text-sm ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .map((page) => (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`px-3 py-1 rounded-md border text-sm ${
                                currentPage === page
                                  ? "bg-black text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-md border text-sm ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this lead? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Assessment Floating Button */}
      <div className="fixed bottom-8 right-8 group z-50">
        <Link href="/" className="bg-[#11b981] hover:bg-[#0ea271] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </Link>
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-gray-900 text-white text-sm rounded py-1 px-2 whitespace-nowrap">
            Assessment Form
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
AdminPage.displayName = 'AdminPage'; 