// src/renderer/src/types/electron.d.ts
export interface ElectronAPI {
  database: {
    connect: (connectionString: string) => Promise<{
      success: boolean
      version?: string
      error?: string
    }>
    testQuery: () => Promise<{
      success: boolean
      data?: Array<{ table_schema: string; table_name: string }>
      error?: string
    }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
