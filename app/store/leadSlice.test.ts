import { configureStore } from '@reduxjs/toolkit';
import leadReducer, { 
  fetchLeads, 
  fetchLeadById, 
  submitLead, 
  updateLeadStatus, 
  deleteLead,
  clearCurrentLead,
  setLeadStatus
} from './leadSlice';
import { LeadStatus } from '../types';

// Mock the leadService API
jest.mock('../services/api', () => ({
  leadService: {
    getLeads: jest.fn(),
    getLead: jest.fn(),
    submitLead: jest.fn(),
    updateLeadStatus: jest.fn(),
    deleteLead: jest.fn()
  }
}));

import { leadService } from '../services/api';

describe('leadSlice', () => {
  let store: ReturnType<typeof setupStore>;
  
  const setupStore = () => configureStore({
    reducer: {
      leads: leadReducer
    }
  });
  
  const mockLeads = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      linkedInProfile: 'https://linkedin.com/in/johndoe',
      status: LeadStatus.PENDING,
      submittedAt: new Date().toISOString(),
      visasOfInterest: ['H-1B']
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      linkedInProfile: 'https://linkedin.com/in/janesmith',
      status: LeadStatus.REACHED_OUT,
      submittedAt: new Date().toISOString(),
      visasOfInterest: ['L-1']
    }
  ];
  
  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });
  
  // Test initial state
  it('should have the correct initial state', () => {
    const state = store.getState().leads;
    expect(state.leads).toEqual([]);
    expect(state.lead).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });
  
  // Test fetchLeads
  describe('fetchLeads', () => {
    it('should handle fetchLeads.pending', async () => {
      const action = { type: fetchLeads.pending.type };
      const state = leadReducer(undefined, action);
      expect(state.status).toBe('loading');
    });
    
    it('should handle fetchLeads.fulfilled', async () => {
      (leadService.getLeads as jest.Mock).mockResolvedValue(mockLeads);
      
      await store.dispatch(fetchLeads());
      
      const state = store.getState().leads;
      expect(state.status).toBe('succeeded');
      expect(state.leads).toEqual(mockLeads);
      expect(state.error).toBeNull();
    });
    
    it('should handle fetchLeads.rejected', async () => {
      const errorMessage = 'Failed to fetch leads';
      (leadService.getLeads as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      await store.dispatch(fetchLeads());
      
      const state = store.getState().leads;
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
    });
  });
  
  // Test fetchLeadById
  describe('fetchLeadById', () => {
    it('should handle fetchLeadById.fulfilled', async () => {
      const lead = mockLeads[0];
      (leadService.getLead as jest.Mock).mockResolvedValue(lead);
      
      await store.dispatch(fetchLeadById('1'));
      
      const state = store.getState().leads;
      expect(state.status).toBe('succeeded');
      expect(state.lead).toEqual(lead);
    });
  });
  
  // Test submitLead
  describe('submitLead', () => {
    it('should handle submitLead.fulfilled', async () => {
      const newLead = {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        linkedInProfile: 'https://linkedin.com/in/newuser',
        visasOfInterest: ['H-1B']
      };
      
      const createdLead = {
        ...newLead,
        id: '3',
        status: LeadStatus.PENDING,
        submittedAt: new Date().toISOString(),
        visasOfInterest: ['H-1B']
      };
      
      (leadService.submitLead as jest.Mock).mockResolvedValue(createdLead);
      
      await store.dispatch(submitLead(newLead));
      
      const state = store.getState().leads;
      expect(state.status).toBe('succeeded');
      expect(state.leads[0]).toEqual(createdLead);
    });
  });
  
  // Test updateLeadStatus
  describe('updateLeadStatus', () => {
    it('should handle updateLeadStatus.fulfilled', async () => {
      // First set up some initial state
      (leadService.getLeads as jest.Mock).mockResolvedValue(mockLeads);
      await store.dispatch(fetchLeads());
      
      const updatedLead = {
        ...mockLeads[0],
        status: LeadStatus.REACHED_OUT
      };
      
      (leadService.updateLeadStatus as jest.Mock).mockResolvedValue(updatedLead);
      
      await store.dispatch(updateLeadStatus({ 
        id: updatedLead.id, 
        status: LeadStatus.REACHED_OUT 
      }));
      
      const state = store.getState().leads;
      // Find the updated lead in the leads array
      const lead = state.leads.find(l => l.id === updatedLead.id);
      expect(lead).toBeDefined();
      expect(lead?.status).toBe(LeadStatus.REACHED_OUT);
    });
  });
  
  // Test deleteLead
  describe('deleteLead', () => {
    it('should handle deleteLead.fulfilled', async () => {
      // First set up some initial state
      (leadService.getLeads as jest.Mock).mockResolvedValue(mockLeads);
      await store.dispatch(fetchLeads());
      
      (leadService.deleteLead as jest.Mock).mockResolvedValue(undefined);
      
      await store.dispatch(deleteLead('1'));
      
      const state = store.getState().leads;
      expect(state.leads.length).toBe(1);
      expect(state.leads.find(lead => lead.id === '1')).toBeUndefined();
    });
  });
  
  // Test clearCurrentLead reducer
  describe('clearCurrentLead', () => {
    it('should clear the current lead', async () => {
      // First set a current lead
      const lead = mockLeads[0];
      (leadService.getLead as jest.Mock).mockResolvedValue(lead);
      await store.dispatch(fetchLeadById('1'));
      
      // Now clear it
      store.dispatch(clearCurrentLead());
      
      const state = store.getState().leads;
      expect(state.lead).toBeNull();
    });
  });
  
  // Test setLeadStatus reducer
  describe('setLeadStatus', () => {
    it('should update the status of a lead', async () => {
      // First set up some initial state
      (leadService.getLeads as jest.Mock).mockResolvedValue(mockLeads);
      await store.dispatch(fetchLeads());
      
      store.dispatch(setLeadStatus({ 
        id: '1', 
        status: LeadStatus.REACHED_OUT 
      }));
      
      const state = store.getState().leads;
      const lead = state.leads.find(l => l.id === '1');
      expect(lead).toBeDefined();
      expect(lead?.status).toBe(LeadStatus.REACHED_OUT);
    });
  });
}); 