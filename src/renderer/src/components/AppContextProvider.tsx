import { DatabaseConnection } from 'src/types/electronAPI';
import { getConnectionString } from '@renderer/App';
import React, { createContext, useContext, useEffect } from 'react';

type AppState = {
  connection?: DatabaseConnection;
  previousConnections?: DatabaseConnection[];
  showCodePanel: boolean;
  isConnected: boolean;
  connectionError?: string;
  otherFlag?: boolean;
  someData?: string;
  showChat: boolean;
};

type ContextType = {
  appState: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  reconnect: () => Promise<void>;
};

const Context = createContext<ContextType | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = React.useState<AppState>({
    showCodePanel: false,
    isConnected: false,
    showChat: false,
  });

  useEffect(() => {
    const unsubscribe = window.electronAPI.database.onConnectionStatus(
      (status) => {
        setState((prevState) => ({
          ...prevState,
          isConnected: status.connected,
          connectionError: status.error ?? undefined,
        }));
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.connection) {
      const connectToDatabase = async () => {
        try {
          const connectionString = getConnectionString(state.connection!);
          const result =
            await window.electronAPI.database.connect(connectionString);

          if (!result.success) {
            setState((prev) => ({
              ...prev,
              connectionError: result.error ?? undefined,
              isConnected: false,
            }));
          }
        } catch (err) {
          setState((prev) => ({
            ...prev,
            connectionError:
              err instanceof Error ? err.message : 'Connection failed',
            isConnected: false,
          }));
        }
      };

      connectToDatabase();
    }
  }, [state.connection]);

  const reconnect = React.useCallback(async () => {
    if (!state.connection) {
      setState((prev) => ({
        ...prev,
        connectionError: 'No connection available',
      }));
      return;
    }

    try {
      const connectionString = getConnectionString(state.connection);
      const result =
        await window.electronAPI.database.connect(connectionString);

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          connectionError: result.error,
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        connectionError:
          err instanceof Error ? err.message : 'Failed to reconnect',
      }));
    }
  }, [state.connection]);

  return (
    <Context.Provider value={{ appState: state, setState, reconnect }}>
      {children}
    </Context.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

export default AppContextProvider;
