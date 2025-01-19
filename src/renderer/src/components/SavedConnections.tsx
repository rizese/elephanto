import { DatabaseConnection } from '@renderer/types/settings';
import { Edit2, Trash2, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeleteConfirmation } from './DeleteConfirmation';
import FadeOut from './FadeOut';
import { useSafeStorage } from '@renderer/hooks/useSafeStorage';

interface SavedConnectionsProps {
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (connection: DatabaseConnection) => void;
  onSelect: (connection: DatabaseConnection) => void;
  error?: string;
  clearError?: () => void;
}

export const SavedConnections = ({
  onEdit,
  onDelete,
  onSelect,
  error,
  clearError,
}: SavedConnectionsProps): JSX.Element => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [connectionDump, setConnectionDump] = useState<object>();
  const { decryptAndRetrieve } = useSafeStorage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [deleteConnection, setDeleteConnection] =
    useState<DatabaseConnection | null>(null);

  const getDisplayName = (connection: DatabaseConnection): string => {
    return connection.name || connection.database;
  };

  const getConnectionDetails = (connection: DatabaseConnection): string => {
    return `${connection.username}@${connection.host}:${connection.port}`;
  };

  useEffect(() => {
    const fetchConnections = async () => {
      const connections =
        await decryptAndRetrieve<DatabaseConnection[]>('connections');
      console.log(connections?.data);
      const directCallResults =
        await window.electronAPI.safeStorage.decryptAndRetrieve();
      console.log({ directCallResults });
      debugger;
      if (connections?.success && connections?.data) {
        setConnections(connections.data);
      }
    };
    fetchConnections();
  }, []);

  useEffect(() => {
    const fetchConnectionDump = async () => {
      const connectionDump =
        await window.electronAPI.safeStorage.decryptAndRetrieve();
      setConnectionDump(connectionDump);
    };
    fetchConnectionDump();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <FadeOut time={2000} onComplete={clearError}>
          <div className="text-red-800 italic pb-3 uppercase flex items-center">
            <CircleAlert className="w-4 h-4 mr-1 inline-block" />
            {error}
          </div>
        </FadeOut>
      )}
      {connectionDump && <pre>{JSON.stringify(connectionDump, null, 2)}</pre>}
      {connections &&
        connections.length > 0 &&
        connections.map((connection, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              className="group/item flex flex-col w-full text-left truncate p-5 rounded-md border border-zinc-800 hover:bg-zinc-800"
              onClick={() => onSelect(connection)}
            >
              <div className="text-lg font-medium">
                {getDisplayName(connection)}
              </div>
              <div className="text-sm text-gray-400">
                {getConnectionDetails(connection)}
              </div>
            </button>

            {hoveredIndex === index && (
              <>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-row gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(connection);
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded text-sm"
                  >
                    Connect
                  </button>
                  <div className=" rounded-full bg-zinc-850 px-1 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(connection);
                      }}
                      className="p-2 rounded-full hover:bg-zinc-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConnection(connection);
                      }}
                      className="p-2 rounded-full hover:bg-zinc-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

      <DeleteConfirmation
        isOpen={!!deleteConnection}
        onClose={() => setDeleteConnection(null)}
        onConfirm={() => {
          if (deleteConnection) {
            onDelete(deleteConnection);
            setDeleteConnection(null);
          }
        }}
        connectionName={
          deleteConnection ? getDisplayName(deleteConnection) : ''
        }
      />
    </div>
  );
};
