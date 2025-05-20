import { Lead, LeadStatus } from '../types';
import { leadService } from './api';

// Mock global fetch
global.fetch = jest.fn();

// Mock response helper
function mockFetchResponse(data: any, status = 200, statusText = 'OK') {
  return Promise.resolve({
    status,
    statusText,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(data),
  } as Response);
}

describe('leadService', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getLeads', () => {
    it('returns a list of leads', async () => {
      const mockLeads: Lead[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          country: 'USA',
          linkedInProfile: 'https://linkedin.com/in/johndoe',
          status: LeadStatus.PENDING,
          submittedAt: '2023-01-01',
          visasOfInterest: ['O-1'],
          additionalInformation: 'Test information',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(mockLeads)
      );

      const leads = await leadService.getLeads();
      expect(leads).toEqual(mockLeads);
      expect(global.fetch).toHaveBeenCalledWith('/api/leads');
    });

    it('throws error on failed fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse({ message: 'Failed to fetch leads' }, 500)
      );

      await expect(leadService.getLeads()).rejects.toThrow('Failed to fetch leads');
    });
  });

  describe('getLead', () => {
    it('returns a lead by ID', async () => {
      const mockLead: Lead = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        country: 'USA',
        linkedInProfile: 'https://linkedin.com/in/johndoe',
        status: LeadStatus.PENDING,
        submittedAt: '2023-01-01',
        visasOfInterest: ['O-1'],
        additionalInformation: 'Test information',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(mockLead)
      );

      const lead = await leadService.getLead('1');
      expect(lead).toEqual(mockLead);
      expect(global.fetch).toHaveBeenCalledWith('/api/leads/1');
    });

    it('returns null for non-existent lead ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse({ message: 'Lead not found' }, 404)
      );

      const lead = await leadService.getLead('non-existent-id');
      expect(lead).toBeNull();
    });
  });

  describe('submitLead', () => {
    it('creates a new lead', async () => {
      const mockLead: Lead = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        country: 'USA',
        linkedInProfile: 'https://linkedin.com/in/johndoe',
        status: LeadStatus.PENDING,
        submittedAt: '2023-01-01',
        visasOfInterest: ['O-1'],
        additionalInformation: 'Test information',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse({ lead: mockLead })
      );

      const formData = new FormData();
      formData.append('firstName', 'John');
      
      const lead = await leadService.submitLead(formData);
      expect(lead).toEqual(mockLead);
      expect(global.fetch).toHaveBeenCalledWith('/api/assessment', expect.any(Object));
    });
  });

  describe('updateLeadStatus', () => {
    it('updates a lead status', async () => {
      const mockLead: Lead = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        country: 'USA',
        linkedInProfile: 'https://linkedin.com/in/johndoe',
        status: LeadStatus.REACHED_OUT,
        submittedAt: '2023-01-01',
        visasOfInterest: ['O-1'],
        additionalInformation: 'Test information',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(mockLead)
      );

      const updatedLead = await leadService.updateLeadStatus('1', LeadStatus.REACHED_OUT);
      expect(updatedLead).toEqual(mockLead);
      expect(global.fetch).toHaveBeenCalledWith('/api/leads/1', expect.any(Object));
    });

    it('throws error for non-existent lead ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse({ message: 'Lead not found' }, 404)
      );

      await expect(
        leadService.updateLeadStatus('non-existent-id', LeadStatus.PENDING)
      ).rejects.toThrow('Failed to update lead status');
    });
  });

  describe('deleteLead', () => {
    it('deletes a lead', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse({ success: true })
      );

      await expect(leadService.deleteLead('1')).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalledWith('/api/leads/1', expect.any(Object));
    });
  });
}); 