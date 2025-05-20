"use client";

import React, { useState, useEffect } from "react";
import { Lead, LeadStatus } from "../types";
import { AuthCheck } from "../components/AuthCheck";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchLeads } from "../store/leadSlice";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { mapStatusToDisplay } from "../utils/statusMapper";

type SortField = "name" | "submittedAt" | "status" | "country";
type SortDirection = "asc" | "desc";

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
      <div className="min-h-screen flex flex-row bg-white">
        {/* Sidebar */}
        <div className="w-60 min-h-screen bg-gradient-to-br from-[#FCFCD9] to-white border-r border-gray-200">
          <div className="text-2xl font-bold tracking-wide text-black pl-6 py-4">almã</div>
          
          <nav className="mt-6">
            <div className="font-medium border-l-4 border-black bg-white text-black font-semibold px-4 py-2">
              <span className="block">Leads</span>
            </div>
            <div className="font-medium text-gray-500 hover:text-black transition-colors px-6 py-2">
              <span className="block">Settings</span>
            </div>
          </nav>
          
          <div className="absolute bottom-0 left-0 w-60 p-6 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-black"
            >
              <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center mr-3 text-sm font-medium">A</div>
              <span className="font-medium">Admin</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 sm:p-10">
          <div className="max-w-6xl mx-auto">
            <header className="mb-6">
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
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11b981]" data-testid="loading-spinner"></div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leads found
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                  <table className="w-full">
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
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                          className="text-gray-800 text-sm border-t hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => router.push(`/admin/leads/${lead.id}`)}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
            
                  {/* Pagination Controls in footer */}
            {!isLoading && totalPages > 1 && (
                    <div className="flex justify-end items-center gap-2 px-6 py-4 border-t">
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
    </AuthCheck>
  );
}
AdminPage.displayName = 'AdminPage'; 