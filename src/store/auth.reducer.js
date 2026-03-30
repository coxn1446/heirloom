import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isProfileComplete: false,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthFromMock(state, action) {
      const { user, isProfileComplete } = action.payload;
      state.user = user;
      state.isAuthenticated = Boolean(user);
      state.isProfileComplete = Boolean(isProfileComplete);
      state.status = 'ready';
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      state.status = 'ready';
    },
    setAuthStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setAuthFromMock, clearAuth, setAuthStatus } = authSlice.actions;
export default authSlice.reducer;
