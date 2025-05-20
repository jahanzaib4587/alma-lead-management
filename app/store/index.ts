import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './leadSlice';

export const store = configureStore({
  reducer: {
    leads: leadReducer,
    // Add other reducers here as your app grows
  },
  // Add middleware or other store enhancers here if needed
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 