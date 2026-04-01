import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle',
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalogStatus(state, action) {
      state.status = action.payload;
    },
    setItems(state, action) {
      state.items = action.payload;
    },
    resetCatalog(state) {
      state.items = [];
      state.status = 'idle';
    },
  },
});

export const { setCatalogStatus, setItems, resetCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;
