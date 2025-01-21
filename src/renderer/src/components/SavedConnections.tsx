import { DatabaseConnection } from 'src/types/electronAPI';
import { Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeleteConfirmation } from './DeleteConfirmation';
import { useSafeStorage } from '@renderer/hooks/useSafeStorage';
import { makeName } from '@renderer/utils';

interface SavedConnectionsProps {
  onEdit: (connection: DatabaseConnection) => void;
  onSelect: (connection: DatabaseConnection) => void;
  error?: string;
  clearError?: () => void;
}

export const SavedConnections = ({
  onEdit,
  onSelect,
}: SavedConnectionsProps): JSX.Element => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const { getConnections } = useSafeStorage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [deleteConnection, setDeleteConnection] =
    useState<DatabaseConnection | null>(null);

  const getConnectionDetails = (connection: DatabaseConnection): string => {
    return `${connection.username}@${connection.host}:${connection.port}`;
  };

  useEffect(() => {
    const fetchConnections = async () => {
      const { data } = await getConnections();
      if (data) {
        // Convert the object into an array of connections
        const connectionsArray = Object.values(data);
        setConnections(connectionsArray);
      }
    };
    fetchConnections();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {connections.map((connection, index) => (
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
            <div className="text-lg font-medium">{makeName(connection)}</div>
            <div className="text-sm text-gray-400">
              {getConnectionDetails(connection)}
            </div>
          </button>

          {hoveredIndex === index && (
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
              <div className="rounded-full bg-zinc-850 px-1 flex gap-2">
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
          )}
        </div>
      ))}

      <DeleteConfirmation
        isOpen={!!deleteConnection}
        onClose={() => setDeleteConnection(null)}
        onConfirm={() => {
          if (deleteConnection) {
            // TODO: Implement delete connection
            setDeleteConnection(null);
          }
        }}
        connectionName={deleteConnection ? makeName(deleteConnection) : ''}
      />
    </div>
  );
};
