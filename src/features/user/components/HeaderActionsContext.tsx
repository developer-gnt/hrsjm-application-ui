import React, { createContext, useContext } from 'react';

export interface HeaderActions {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  hasUnreadNotifications?: boolean;
}

const HeaderActionsContext = createContext<HeaderActions>({});

export const HeaderActionsProvider: React.FC<
  React.PropsWithChildren<{ value: HeaderActions }>
> = ({ value, children }) => (
  <HeaderActionsContext.Provider value={value}>
    {children}
  </HeaderActionsContext.Provider>
);

export const useHeaderActions = (): HeaderActions =>
  useContext(HeaderActionsContext);
