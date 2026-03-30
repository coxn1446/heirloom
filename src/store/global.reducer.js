import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appName: 'Heirloom',
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {},
});

export default globalSlice.reducer;
