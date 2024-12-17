import { useState } from 'react'
import { MakeConnectionPage } from './page/MakeConnection'
import { SchemaVisualizerPage } from './page/SchemaVisualizerPage'
import { DatabaseConnection } from './types/settings'

export function App(): JSX.Element {
  const [connection, setConnection] = useState<DatabaseConnection | null>(null)
  const handleConnect = (connection: DatabaseConnection): void => {
    setConnection(connection)
  }

  if (!connection) {
    return <MakeConnectionPage onSuccessfulConnection={handleConnect} />
  }
  return <SchemaVisualizerPage connection={connection} />
}

export const getConnectionStringForDisplay = (connection: DatabaseConnection): string => {
  const password = connection.password
    ? connection.password
    : '*'.repeat(connection.password.length)
  return `postgresql://${connection.username}${connection.password && ':' + password}${(connection.username || connection.password) && '@'}${connection.host}${connection.port && ':' + connection.port}${connection.database && '/'}${connection.database}`
}
