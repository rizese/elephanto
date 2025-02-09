import { useState, useEffect } from 'react';
import { useSafeStorage } from '../hooks/useSafeStorage';

export const ConnectionsDump = () => {
  const { getConnections } = useSafeStorage();
  const [loadedConnections, setLoadedConnections] = useState<any>([]);

  useEffect(() => {
    const loadConnections = async () => {
      const result = await getConnections();
      if (result.success) {
        setLoadedConnections(result.data);
      }
    };
    loadConnections();
  }, []);

  return <pre>{JSON.stringify(loadedConnections, null, 2)}</pre>;
};
