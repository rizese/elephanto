import { DatabaseConnection } from '@renderer/types/settings';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmation } from './DeleteConfirmation';

interface SavedConnectionsProps {
  connections: DatabaseConnection[];
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (connection: DatabaseConnection) => void;
  onSelect: (connection: DatabaseConnection) => void;
}

export const SavedConnections = ({
  connections,
  onEdit,
  onDelete,
  onSelect,
}: SavedConnectionsProps): JSX.Element => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [deleteConnection, setDeleteConnection] =
    useState<DatabaseConnection | null>(null);

  const getDisplayName = (connection: DatabaseConnection): string => {
    return connection.name || connection.database;
  };

  const getConnectionDetails = (connection: DatabaseConnection): string => {
    return `${connection.username}@${connection.host}:${connection.port}`;
  };

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
            className="flex flex-col w-full text-left truncate p-5 rounded-md border border-zinc-800 hover:bg-zinc-800"
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex px-1 gap-2 bg-zinc-850 rounded-full">
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
