import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/redux/slices';

const store = configureStore({ reducer: rootReducer });

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;

export default store;