import React, { createContext, useContext, useMemo } from 'react';

const NativeContext = createContext({
  isNative: false,
  platform: 'web',
});

export function NativeProvider({ children }) {
  const value = useMemo(
    () => ({
      isNative: false,
      platform: 'web',
    }),
    []
  );
  return <NativeContext.Provider value={value}>{children}</NativeContext.Provider>;
}

export function useNative() {
  return useContext(NativeContext);
}
