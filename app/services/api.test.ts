import { leadService } from './api';
import { LeadStatus } from '../types';

// Mock timers
jest.useFakeTimers();

describe('leadService', () => {
  // Reset any mock timers or implementations before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeads', () => {
    it('returns a list of leads', async () => {
      const leads = await leadService.getLeads();
      
      // Should have at least one lead
      expect(leads.length).toBeGreaterThan(0);
      
      // Each lead should have the required fields
      leads.forEach(lead => {
        expect(lead).toHaveProperty('id');
        expect(lead).toHaveProperty('firstName');
        expect(lead).toHaveProperty('lastName');
        expect(lead).toHaveProperty('email');
        expect(lead).toHaveProperty('linkedInProfile');
        expect(lead).toHaveProperty('status');
        expect(lead).toHaveProperty('submittedAt');
        expect(lead).toHaveProperty('visasOfInterest');
      });
    });
  });

  describe('getLead', () => {
    it('returns a lead by ID', async () => {
      // First get all leads to get a valid ID
      const leads = await leadService.getLeads();
      const leadId = leads[0].id;
      
      // Now get a specific lead
      const lead = await leadService.getLead(leadId);
      
      // Verify the lead exists and has the correct ID
      expect(lead).not.toBeNull();
      expect(lead?.id).toBe(leadId);
    });

    it('returns null for non-existent lead ID', async () => {
      const lead = await leadService.getLead('non-existent-id');
      expect(lead).toBeNull();
    });
  });

  describe('submitLead', () => {
    it('creates a new lead', async () => {
      const leadData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        linkedInProfile: 'https://linkedin.com/in/testuser',
        visasOfInterest: ['H-1B'],
        country: 'Test Country'
      };
      
      // Submit the lead
      const newLead = await leadService.submitLead(leadData);
      
      // Verify the lead was created with correct data
      expect(newLead).toHaveProperty('id');
      expect(newLead.firstName).toBe(leadData.firstName);
      expect(newLead.lastName).toBe(leadData.lastName);
      expect(newLead.email).toBe(leadData.email);
      expect(newLead.linkedInProfile).toBe(leadData.linkedInProfile);
      expect(newLead.status).toBe(LeadStatus.PENDING);
      expect(newLead.visasOfInterest).toEqual(leadData.visasOfInterest);
      expect(newLead.country).toBe(leadData.country);
      
      // Check if submittedAt is a valid date string
      expect(Date.parse(newLead.submittedAt)).not.toBeNaN();
    });
  });

  describe('updateLeadStatus', () => {
    it('updates a lead status', async () => {
      // First get all leads to get a valid ID
      const leads = await leadService.getLeads();
      const leadId = leads[0].id;
      const initialStatus = leads[0].status;
      
      // Determine the new status (opposite of current)
      const newStatus = initialStatus === LeadStatus.PENDING
        ? LeadStatus.REACHED_OUT
        : LeadStatus.PENDING;
      
      // Update the lead status
      const updatedLead = await leadService.updateLeadStatus(leadId, newStatus);
      
      // Verify the status was updated
      expect(updatedLead.id).toBe(leadId);
      expect(updatedLead.status).toBe(newStatus);
    });

    it('throws error for non-existent lead ID', async () => {
      await expect(
        leadService.updateLeadStatus('non-existent-id', LeadStatus.PENDING)
      ).rejects.toThrow('Lead not found');
    });
  });

  describe('deleteLead', () => {
    it('deletes a lead', async () => {
      // First get all leads to get a valid ID
      const initialLeads = await leadService.getLeads();
      const leadId = initialLeads[0].id;
      const initialCount = initialLeads.length;
      
      // Delete the lead
      await leadService.deleteLead(leadId);
      
      // Verify the lead was deleted
      const remainingLeads = await leadService.getLeads();
      
      expect(remainingLeads.length).toBe(initialCount - 1);
      expect(remainingLeads.find(lead => lead.id === leadId)).toBeUndefined();
    });
  });
}); 