// src/renderer/src/hooks/useSafeStorage.ts
import { useCallback } from 'react';
import { DatabaseConnection } from '../../../types/electronAPI';

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

  const deleteConnection = useCallback(
    async (name: string): Promise<boolean> => {
      const success = await setConnections((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
      return success;
    },
    [],
  );

  return { setConnections, getConnections, deleteConnection };
}
