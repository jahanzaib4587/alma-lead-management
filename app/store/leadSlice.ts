import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Lead } from '../types';
import { LeadStatus } from '../types';
import { leadService } from '../services/api';

// Define the slice state interface
interface LeadState {
  leads: Lead[];
  lead: Lead | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state with dummy data for instant feedback
const initialState: LeadState = {
  leads: [
    {
      id: 'dummy-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@alma.com',
      linkedInProfile: 'https://linkedin.com/in/johndoe',
      country: 'USA',
      status: LeadStatus.PENDING,
      submittedAt: '2023-10-10T14:48:00',
      visasOfInterest: ['O-1'],
      additionalInformation: 'Looking for visa options for tech professionals'
    },
    {
      id: 'dummy-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@alma.com',
      linkedInProfile: 'https://linkedin.com/in/janesmith',
      country: 'UK',
      status: LeadStatus.REACHED_OUT,
      submittedAt: '2023-09-15T09:30:00',
      visasOfInterest: ['EB-1', 'EB-2 NIW'],
      additionalInformation: 'PhD researcher seeking immigration options'
    }
  ] as Lead[],
  lead: null,
  status: 'idle',
  error: null
};

// Async thunks for API interactions
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async () => {
    return await leadService.getLeads();
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id: string) => {
    return await leadService.getLead(id);
  }
);

export const submitLead = createAsyncThunk(
  'leads/submitLead',
  async (leadData: FormData) => {
    return await leadService.submitLead(leadData);
  }
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ id, status }: { id: string; status: LeadStatus }) => {
    return await leadService.updateLeadStatus(id, status);
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string) => {
    await leadService.deleteLead(id);
    return id;
  }
);

export const submitAssessment = createAsyncThunk(
  'leads/submitAssessment',
  async (formData: FormData) => {
    return await leadService.submitLead(formData);
  }
);

// Create the leads slice
const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearCurrentLead: (state) => {
      state.lead = null;
    },
    setLeadStatus: (state, action: PayloadAction<{id: string, status: LeadStatus}>) => {
      const { id, status } = action.payload;
      const lead = state.leads.find(lead => lead.id === id);
      if (lead) {
        lead.status = status;
      }
    },
    // Add direct lead addition for instant feedback
    addLead: (state, action: PayloadAction<Lead>) => {
      state.leads.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchLeads
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch leads';
      })
      
      // Handle fetchLeadById
      .addCase(fetchLeadById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch lead';
      })
      
      // Handle submitLead
      .addCase(submitLead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitLead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads.unshift(action.payload); // Add new lead to the beginning of the array
      })
      .addCase(submitLead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to submit lead';
      })
      
      // Handle submitAssessment
      .addCase(submitAssessment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads.unshift(action.payload);
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to submit assessment';
      })
      
      // Handle updateLeadStatus
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.lead?.id === action.payload.id) {
          state.lead = action.payload;
        }
      })
      
      // Handle deleteLead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead.id !== action.payload);
      });
  }
});

export const { clearCurrentLead, setLeadStatus, addLead } = leadSlice.actions;
export default leadSlice.reducer; 