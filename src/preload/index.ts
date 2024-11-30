// src/preload/index.ts
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { DatabaseAPI } from '../renderer/src/types/database'

// Database API
const dbAPI: DatabaseAPI = {
  connect: (connectionString: string) => ipcRenderer.invoke('db:connect', connectionString),

  getSchemas: () => ipcRenderer.invoke('db:get-schemas'),

  getTables: (schema: string) => ipcRenderer.invoke('db:get-tables', schema),

  getTableStructure: (schema: string, table: string) =>
    ipcRenderer.invoke('db:get-table-structure', schema, table),

  getRelations: (schema: string, table: string) =>
    ipcRenderer.invoke('db:get-relations', schema, table),

  executeQuery: (query: string) => ipcRenderer.invoke('db:execute-query', query)
}

// Use contextBridge to expose our API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  ...electronAPI,
  database: dbAPI,
  // Preserve any existing template APIs you want to keep
  ipcRenderer: { ...ipcRenderer }
})

// `exposeInMainWorld` can't detect attributes and methods of `exports` in runtime.
// Use the explicit export to make attributes and methods available in the preload process.
export type { DatabaseAPI } from '../renderer/src/types/database'
