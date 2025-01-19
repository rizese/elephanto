// import { useState } from 'react';
import { MakeConnectionPage } from './page/MakeConnection';
import { SchemaVisualizerPage } from './page/SchemaVisualizerPage';
import { DatabaseConnection } from './types/settings';
import { useAppContext } from './components/AppContextProvider';
import { useEffect, useState } from 'react';

export function App(): JSX.Element {
  const [hasConnected, setHasConnected] = useState<boolean>(false);
  const { appState: state, setState } = useAppContext();
  const handleConnect = (connection: DatabaseConnection): void => {
    setHasConnected(true);
    setState((prev) => ({
      ...prev,
      connection,
    }));
  };

  useEffect(() => {
    const disconnect = async () => {
      if (!state.connection && hasConnected) {
        try {
          await window.electronAPI.database.disconnect();
          console.log('Disconnected from database');
        } catch (error) {
          console.error('Failed to disconnect from database:', error);
        }
      }
    };
    disconnect();
  }, [state.connection, hasConnected]);

  return (
    <>
      {state.connection ? (
        <SchemaVisualizerPage connection={state.connection} />
      ) : (
        <MakeConnectionPage onSuccessfulConnection={handleConnect} />
      )}
    </>
  );
}

export const getConnectionString = (connection: DatabaseConnection): string => {
  return `postgresql://${connection.username}${(connection.username || connection.password) && ':'}${connection.password}${(connection.username || connection.password) && '@'}${connection.host}:${connection.port}${connection.database && '/'}${connection.database}`;
};

export const getConnectionStringForDisplay = (
  connection: DatabaseConnection,
): string => {
  const password = connection.password
    ? connection.password
    : '*'.repeat(connection.password.length);
  return `postgresql://${connection.username}${connection.password && ':' + password}${(connection.username || connection.password) && '@'}${connection.host}${connection.port && ':' + connection.port}${connection.database && '/'}${connection.database}`;
};
