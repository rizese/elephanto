import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  ...electronAPI,
  database: {
    connect: (connectionString: string) => ipcRenderer.invoke('db:connect', connectionString),
    testQuery: () => ipcRenderer.invoke('db:test-query')
  }
})

// Update the type definitions
export type ElectronAPI = {
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

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
