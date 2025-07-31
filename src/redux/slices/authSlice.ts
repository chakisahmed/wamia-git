// app/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerDetails } from '@/api/customerApi';



export interface AuthState {
  userToken: string | null;
  user: CustomerDetails | null;
}

const initialState: AuthState = {
  userToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserToken(state, action: PayloadAction<string | null>) {
      state.userToken = action.payload;
    },
    setUser(state, action: PayloadAction<CustomerDetails | null>) {
      state.user = action.payload;
    },
    logout(state) {
      state.userToken = null;
      state.user = null;
    },
  },
});

export const { setUserToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
