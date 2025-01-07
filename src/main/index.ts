// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { Client, QueryResult } from 'pg';
import { DatabaseError } from 'pg-protocol';

// Types for database operations
interface DatabaseClient {
  client: Client | null;
  isConnected: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

interface ForeignKeyRelation {
  constraint_name: string;
  table_schema: string;
  table_name: string;
  column_name: string;
  foreign_table_schema: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

// Database state
let dbState: DatabaseClient = {
  client: null,
  isConnected: false,
  lastError: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3,
};

// Query timeout wrapper
const executeQueryWithTimeout = async <T>(
  query: string,
  params: any[] = [],
  timeout: number = 30000,
): Promise<QueryResult<T>> => {
  if (!dbState.client) {
    throw new Error('Database not connected');
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timed out after ${timeout}ms`));
    }, timeout);
  });

  const queryPromise = dbState.client.query(query, params);
  return Promise.race([queryPromise, timeoutPromise]);
};

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
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function setupConnectionEventHandlers(
  client: Client,
  mainWindow: BrowserWindow,
) {
  client.on('error', (err) => {
    console.error('Database connection error:', err);
    dbState.isConnected = false;
    dbState.lastError = err.message;

    // Notify renderer process
    mainWindow.webContents.send('db:connection-status', {
      connected: false,
      error: err.message,
    });
  });

  client.on('end', () => {
    console.log('Database connection ended');
    dbState.isConnected = false;

    mainWindow.webContents.send('db:connection-status', {
      connected: false,
      error: 'Connection ended',
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Register IPC Handlers
ipcMain.handle('db:connect', async (_event, connectionString: string) => {
  try {
    if (dbState.client) {
      await dbState.client.end();
    }

    const connectionWithSSL =
      connectionString.includes('sslmode=') ||
      connectionString.includes('localhost')
        ? connectionString
        : `${connectionString}${connectionString.includes('?') ? '&' : '?'}sslmode=require`;

    dbState.client = new Client(connectionWithSSL);
    setupConnectionEventHandlers(
      dbState.client,
      BrowserWindow.getFocusedWindow()!,
    );

    await dbState.client.connect();
    const result = await dbState.client.query('SELECT version()');
    dbState.isConnected = true;
    dbState.lastError = null;

    return {
      success: true,
      version: result.rows[0].version,
      serverVersion: result.rows[0].version.split(' ')[1],
    };
  } catch (error) {
    dbState = {
      ...dbState,
      client: null,
      isConnected: false,
      lastError: error instanceof Error ? error.message : 'Unknown error',
    };

    return {
      success: false,
      error: dbState.lastError,
    };
  }
});

ipcMain.handle('db:disconnect', async () => {
  try {
    if (dbState.client) {
      await dbState.client.end();
      dbState.client = null;
      dbState.isConnected = false;
      dbState.lastError = null;
      return { success: true };
    }
    return { success: true, message: 'Already disconnected' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

ipcMain.handle('db:reconnect', async (_event, connectionString: string) => {
  try {
    if (dbState.client) {
      await dbState.client.end().catch(() => {
        /* ignore cleanup errors */
      });
    }

    const connectionWithSSL =
      connectionString.includes('sslmode=') ||
      connectionString.includes('localhost')
        ? connectionString
        : `${connectionString}${connectionString.includes('?') ? '&' : '?'}sslmode=require`;

    dbState.client = new Client(connectionWithSSL);
    setupConnectionEventHandlers(
      dbState.client,
      BrowserWindow.getFocusedWindow()!,
    );

    await dbState.client.connect();
    dbState.isConnected = true;
    dbState.lastError = null;
    dbState.reconnectAttempts = 0;

    return { success: true };
  } catch (error) {
    dbState.reconnectAttempts += 1;
    dbState.lastError =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      error: dbState.lastError,
      attemptsMade: dbState.reconnectAttempts,
      maxAttempts: dbState.maxReconnectAttempts,
    };
  }
});

ipcMain.handle('db:get-schemas', async () => {
  try {
    const query = `
      SELECT
        table_schema as schema_name,
        COUNT(table_name) as table_count
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      GROUP BY table_schema
      ORDER BY table_schema;
    `;
    const result = await executeQueryWithTimeout(query);
    return { success: true, schemas: result.rows };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

ipcMain.handle('db:get-tables', async (_event, schema: string) => {
  try {
    const query = `
      SELECT
        table_name,
        (SELECT count(*) FROM information_schema.columns WHERE table_name=t.table_name) as column_count,
        obj_description((quote_ident(table_schema) || '.' || quote_ident(table_name))::regclass, 'pg_class') as description
      FROM information_schema.tables t
      WHERE table_schema = $1
      ORDER BY table_name;
    `;
    const result = await executeQueryWithTimeout(query, [schema]);
    return { success: true, tables: result.rows };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});
ipcMain.handle(
  'db:get-table-structure',
  async (_event, schema: string, table: string) => {
    try {
      const query = `
      SELECT
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        pg_catalog.col_description(format('%I.%I', c.table_schema, c.table_name)::regclass::oid, c.ordinal_position) as column_description,
        CASE
          WHEN pk.column_name IS NOT NULL THEN true
          ELSE false
        END as is_primary_key,
        CASE
          WHEN fk.column_name IS NOT NULL THEN true
          ELSE false
        END as is_foreign_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND ku.table_schema = $1
          AND ku.table_name = $2
      ) pk ON c.column_name = pk.column_name
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ku.table_schema = $1
          AND ku.table_name = $2
      ) fk ON c.column_name = fk.column_name
      WHERE c.table_schema = $1
        AND c.table_name = $2
      ORDER BY c.ordinal_position;
    `;
      const result = await executeQueryWithTimeout(query, [schema, table]);
      return { success: true, structure: result.rows };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
);

ipcMain.handle(
  'db:get-relations',
  async (_event, schema: string, table: string) => {
    try {
      const query = `
      SELECT
        tc.constraint_name,
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2;
    `;
      const result = await executeQueryWithTimeout<ForeignKeyRelation>(query, [
        schema,
        table,
      ]);
      return { success: true, relations: result.rows };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
);

ipcMain.handle('db:execute-query', async (_event, query: string) => {
  try {
    const result = await executeQueryWithTimeout(query);
    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map((f) => ({
        name: f.name,
        dataType: f.dataTypeID,
      })),
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      return {
        success: false,
        error: error.message,
        position: error.position,
        detail: error.detail,
        hint: error.hint,
        code: error.code,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle database disconnection on app quit
app.on('before-quit', async () => {
  if (dbState.client) {
    console.log('Closing database connection...');
    await dbState.client.end();
    dbState.client = null;
    dbState.isConnected = false;
  }
});
