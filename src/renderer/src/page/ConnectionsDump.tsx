import { useState, useEffect } from 'react';
import { useSafeStorage } from '@renderer/hooks/useSafeStorage';
// import MarkdownText from '@renderer/components/MarkdownText';

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
  // return (
  //   <MarkdownText
  //     text={`\`\`\`json\n${JSON.stringify(loadedConnections, null, 2)}\n\`\`\``}
  //   />
  // );
};
