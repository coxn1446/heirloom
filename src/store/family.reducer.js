import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  families: [],
};

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamilies(state, action) {
      state.families = action.payload;
    },
    resetFamilies(state) {
      state.families = [];
    },
  },
});

export const { setFamilies, resetFamilies } = familySlice.actions;
export default familySlice.reducer;
