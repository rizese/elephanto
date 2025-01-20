// src/renderer/src/hooks/useSafeStorage.ts
import { useCallback } from 'react';
import { DatabaseConnection } from 'src/types/electronAPI';

interface SafeStorageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useSafeStorage() {
  const setConnections = useCallback(
    async (
      updater: (
        prev: Record<string, DatabaseConnection>,
      ) => Record<string, DatabaseConnection> | null,
    ): Promise<boolean> => {
      try {
        // Get existing connections
        const response = await window.electronAPI.safeStorage.getConnections();
        if (!response.success) throw new Error(response.error);

        // Initialize or use existing data
        const currentConnections = response.data || {};

        // Apply the update
        const updatedConnections = updater(currentConnections);

        if (updatedConnections === null) {
          throw new Error('Delete operation not yet implemented');
        }

        // Store updated connections
        const storeResponse =
          await window.electronAPI.safeStorage.storeConnections(
            updatedConnections,
          );

        if (!storeResponse.success) throw new Error(storeResponse.error);
        return true;
      } catch (error) {
        console.error('Error updating connections:', error);
        return false;
      }
    },
    [],
  );

  const getConnections = useCallback(async (): Promise<
    SafeStorageResponse<Record<string, DatabaseConnection>>
  > => {
    try {
      const response = await window.electronAPI.safeStorage.getConnections();
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      console.error('Error retrieving connections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  return { setConnections, getConnections };
}
// src/types/settings.d.ts

// Example usage:
/*
const { setConnections, getConnections } = useSafeStorage();

// Add/update a connection
await setConnections(prev => ({
  ...prev,
  "Local DB": {
    host: "localhost",
    port: "5432",
    database: "postgres",
    username: "postgres",
    password: "password"
  }
}));

// Get all connections
const result = await getConnections();
if (result.success) {
  const connections = result.data; // Type: Record<string, PostgresConnection>
}

// Delete a connection
await setConnections(prev => {
  const { ["Local DB"]: removed, ...rest } = prev;
  return rest;
});
*/
