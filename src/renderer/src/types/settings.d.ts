// src/types/settings.d.ts

export interface DatabaseConnection {
  name: string
  host: string
  port: string
  username: string
  password: string
  database: string
}

export interface Settings {
  connections: DatabaseConnection[]
  theme?: 'light' | 'dark'
  lastUsedConnection?: string
}

export interface SettingsAPI {
  getConnections: () => Promise<DatabaseConnection[]>
  addConnection: (connection: DatabaseConnection) => Promise<void>
  updateConnection: (name: string, connection: DatabaseConnection) => Promise<void>
  deleteConnection: (name: string) => Promise<void>
  testConnection: (connection: DatabaseConnection) => Promise<boolean>
}
