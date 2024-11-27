import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Client } from 'pg'

// Add this type for database client
let pgClient: Client | null = null

// Add your IPC handlers before creating the window
ipcMain.handle('db:connect', async (_event, connectionConfig: string) => {
  try {
    // Close existing connection if it exists
    if (pgClient) {
      await pgClient.end()
    }

    console.log('Attempting to connect to database...')
    pgClient = new Client(connectionConfig)
    await pgClient.connect()

    // Test the connection with a simple query
    const testResult = await pgClient.query('SELECT version()')
    console.log('Database connected:', testResult.rows[0].version)

    return {
      success: true,
      version: testResult.rows[0].version
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
})

// Add a test query handler
ipcMain.handle('db:test-query', async () => {
  try {
    if (!pgClient) {
      throw new Error('Database not connected')
    }

    const result = await pgClient.query(`
      SELECT
        table_schema,
        table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      LIMIT 5
    `)

    return {
      success: true,
      data: result.rows
    }
  } catch (error) {
    console.error('Test query error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
})

// Clean up database connection on app quit
app.on('before-quit', async () => {
  if (pgClient) {
    console.log('Closing database connection...')
    await pgClient.end()
    pgClient = null
  }
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
