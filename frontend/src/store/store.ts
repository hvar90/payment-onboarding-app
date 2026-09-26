import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './checkoutSlice'; 

export const store = configureStore({
  reducer: {
    checkout: checkoutReducer,
  },
});

// Inferimos los tipos RootState y AppDispatch del propio store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;