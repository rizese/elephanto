import { useCallback } from 'react';

type SafeStorageResponse<T = object> = {
  success: boolean;
  data?: T;
  error?: string;
};

const SafeStorageRootKeys = ['connections', 'settings'] as const;

export const useSafeStorage = () => {
  const encryptAndStore = useCallback(
    async <T>(
      rootKey: (typeof SafeStorageRootKeys)[number],
      subKey: string = '_',
      value: T | null, // Passing `null` will delete the subKey.
    ): Promise<boolean> => {
      try {
        const response =
          await window.electronAPI.safeStorage.decryptAndRetrieve();
        if (!response.success) throw new Error(response.error);

        const currentData = response.data || {};
        const rootData = (currentData[rootKey] || {}) as Record<string, T>;

        if (value === null) {
          // Delete the subKey if `value` is null.
          delete rootData[subKey];
        } else {
          // Upsert the subKey with the new value.
          rootData[subKey] = value;
        }

        const updatedData = {
          ...currentData,
          [rootKey]: rootData,
        };

        const storeResponse =
          await window.electronAPI.safeStorage.encryptAndStore({
            key: rootKey,
            data: updatedData[rootKey],
          });

        if (!storeResponse.success) throw new Error(storeResponse.error);

        return true;
      } catch (error) {
        console.error('Error updating data securely:', error);
        return false;
      }
    },
    [],
  );

  const decryptAndRetrieve = useCallback(
    async <T>(
      rootKey: (typeof SafeStorageRootKeys)[number],
    ): Promise<SafeStorageResponse<T> | undefined> => {
      try {
        const response =
          await window.electronAPI.safeStorage.decryptAndRetrieve();
        if (!response.success) throw new Error(response.error);
        const rootData = response.data?.[rootKey] || {};
        return { success: true, data: rootData as T };
      } catch (error) {
        console.error('Error retrieving data securely:', error);
        return undefined;
      }
    },
    [],
  );

  return { encryptAndStore, decryptAndRetrieve };
};
