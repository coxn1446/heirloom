import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth.reducer';
import globalReducer from './global.reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  global: globalReducer,
});
