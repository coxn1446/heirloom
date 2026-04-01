import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth.reducer';
import catalogReducer from './catalog.reducer';
import familyReducer from './family.reducer';
import globalReducer from './global.reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  catalog: catalogReducer,
  family: familyReducer,
  global: globalReducer,
});
