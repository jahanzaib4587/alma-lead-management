import { Lead, LeadStatus } from "../types";

// In a real application, this would be an environment variable

export const leadService = {
  // Submit a new lead
  async submitLead(formData: FormData): Promise<Lead> {
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      const data = await response.json();
      return data.lead as Lead;
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw error;
    }
  },

  // Get all leads
  async getLeads(): Promise<Lead[]> {
    try {
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      return data as Lead[];
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  // Get a single lead by ID
  async getLead(leadId: string): Promise<Lead | null> {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch lead');
      }
      
      const data = await response.json();
      return data as Lead;
    } catch (error) {
      console.error(`Error fetching lead ${leadId}:`, error);
      throw error;
    }
  },

  // Update lead status
  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }
      
      const data = await response.json();
      return data as Lead;
    } catch (error) {
      console.error("Error updating lead status:", error);
      throw error;
    }
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error);
      throw error;
    }
  }
}; 