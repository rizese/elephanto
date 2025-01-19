// src/preload/index.ts
import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';
import { Database, SafeStorage } from '../renderer/src/types/database';

// Database API
const database: Database = {
  connect: (connectionString: string) =>
    ipcRenderer.invoke('db:connect', connectionString),

  disconnect: async () => {
    console.log('disconnected from database');
    return await ipcRenderer.invoke('db:disconnect');
  },
  getSchemas: () => ipcRenderer.invoke('db:get-schemas'),

  getTables: (schema: string) => ipcRenderer.invoke('db:get-tables', schema),

  getTableStructure: (schema: string, table: string) =>
    ipcRenderer.invoke('db:get-table-structure', schema, table),

  getRelations: (schema: string, table: string) =>
    ipcRenderer.invoke('db:get-relations', schema, table),

  executeQuery: (query: string) =>
    ipcRenderer.invoke('db:execute-query', query),

  onConnectionStatus: (
    callback: (status: { connected: boolean; error: string | null }) => void,
  ) => {
    const subscription = (
      _event: any,
      status: { connected: boolean; error: string | null },
    ) => {
      console.log('Connection status:', status.connected);
      callback(status);
    };

    ipcRenderer.on('db:connection-status', subscription);

    return () => {
      ipcRenderer.removeListener('db:connection-status', subscription);
    };
  },
};

const safeStorage: SafeStorage = {
  encryptAndStore: async (jsonData: object) =>
    await ipcRenderer.invoke('encrypt-and-store', jsonData),

  decryptAndRetrieve: async () =>
    await ipcRenderer.invoke('decrypt-and-retrieve'),
};

// Use contextBridge to expose our API to the renderer process
// defining the window.electronAPI object:
contextBridge.exposeInMainWorld('electronAPI', {
  ...electronAPI,
  database,
  safeStorage,
  // Preserve any existing template APIs you want to keep
  ipcRenderer: { ...ipcRenderer },
});

// `exposeInMainWorld` can't detect attributes and methods of `exports` in runtime.
// Use the explicit export to make attributes and methods available in the preload process.
export type { Database, SafeStorage } from '../renderer/src/types/database';
