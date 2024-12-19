import { useState } from 'react';
import { MakeConnectionPage } from './page/MakeConnection';
import { SchemaVisualizerPage } from './page/SchemaVisualizerPage';
import { DatabaseConnection } from './types/settings';
import { AppContextProvider } from './components/AppContextProvider';

export function App(): JSX.Element {
  const [connection, setConnection] = useState<DatabaseConnection | null>(null);
  const handleConnect = (connection: DatabaseConnection): void => {
    setConnection(connection);
  };

  return (
    <AppContextProvider>
      {connection ? (
        <SchemaVisualizerPage connection={connection} />
      ) : (
        <MakeConnectionPage onSuccessfulConnection={handleConnect} />
      )}
    </AppContextProvider>
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
