import { DatabaseConnection } from '@renderer/types/settings';
import React, { createContext, useContext } from 'react';

type AppState = {
  connection?: DatabaseConnection;
  previousConnections?: DatabaseConnection[];
  showCodePanel: boolean;
  // Add other state properties here
  otherFlag?: boolean;
  someData?: string;
};

type ContextType = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
};

const Context = createContext<ContextType | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = React.useState<AppState>({
    showCodePanel: false,
  });

  return (
    <Context.Provider value={{ state, setState }}>{children}</Context.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};
