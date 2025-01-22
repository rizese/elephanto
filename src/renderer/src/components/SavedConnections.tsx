import { DatabaseConnection } from 'src/types/electronAPI';
import { ArrowDown, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeleteConfirmation } from './DeleteConfirmation';
import { useSafeStorage } from '@renderer/hooks/useSafeStorage';
import { makeName } from '@renderer/utils';

interface SavedConnectionsProps {
  onEdit?: (connection: DatabaseConnection) => void;
  onSelect: (connection: DatabaseConnection) => void;
  error?: string;
  clearError?: () => void;
}

type SavedConnection = DatabaseConnection & {
  id: string;
};

const transformConnection = (
  data: Record<string, DatabaseConnection>,
): SavedConnection[] => {
  return Object.entries(data).map(([key, connection]) => ({
    ...connection,
    id: key,
  }));
};

export const SavedConnections = ({
  // onEdit,
  onSelect,
}: SavedConnectionsProps): JSX.Element => {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const { getConnections, deleteConnection } = useSafeStorage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [connectionToDelete, setConnectionToDelete] =
    useState<SavedConnection | null>();

  const getConnectionDetails = (connection: DatabaseConnection): string => {
    return `${connection.username}@${connection.host}:${connection.port}`;
  };

  useEffect(() => {
    const fetchConnections = async () => {
      const { data } = await getConnections();
      if (data) {
        setConnections(transformConnection(data));
      }
    };
    fetchConnections();
  }, [connectionToDelete]);

  return (
    <div className="flex flex-col gap-2 h-full">
      {connections.map((connection, index) => (
        <div
          key={index}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <button
            className="group/item overflow-x-auto flex flex-col text-nowrap w-full text-left p-5 rounded-md border border-zinc-800 hover:bg-zinc-800"
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
              <div className="rounded-full bg-zinc-850 px-1.5 py-1 flex gap-2">
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(connection);
                  }}
                  className="p-2 rounded-full hover:bg-zinc-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConnectionToDelete(connection);
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
      {connections.length === 0 && (
        <div className="flex flex-col items-center justify-stretch h-full text-center">
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Connect to Postgres</h1>
            <div className="text-center text-gray-400">
              No connections created yet
            </div>
          </div>
          <ArrowDown className="w-10 h-10 animate-bounce" />
        </div>
      )}
      <DeleteConfirmation
        isOpen={!!connectionToDelete}
        onClose={() => setConnectionToDelete(null)}
        onConfirm={async () => {
          if (connectionToDelete) {
            await deleteConnection(connectionToDelete.id);
            setConnectionToDelete(null);
          }
        }}
        connectionName={connectionToDelete ? makeName(connectionToDelete) : ''}
      />
    </div>
  );
};
