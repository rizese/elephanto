import { useState } from 'react';
import { HomeScreenCarousel } from '../components/HomeScreenCarousel';
import { DatabaseConnection } from '@renderer/types/settings';
import SlidePanel from '@renderer/components/SlidePanel';
import { ConnectionForm } from '@renderer/components/ConnectionForm';
import { SavedConnections } from '@renderer/components/SavedConnections';
import { Plus } from 'lucide-react';

export interface ConnectionFormProps {
  onSuccessfulConnection: (connection: DatabaseConnection) => void;
}

export type ConnectionResult = {
  success: boolean;
  version?: string;
  error?: string;
  serverVersion?: string;
};

const previousConnections: DatabaseConnection[] = [
  {
    name: 'Local Postgres',
    username: 'postgres',
    password: 'magicstory',
    host: 'localhost',
    port: '5432',
    database: 'postgres',
  },
  {
    name: 'Local Spara',
    username: 'spara',
    password: 'spara_dev',
    host: 'localhost',
    port: '5432',
    database: 'spara_local',
  },
  {
    name: 'Vercel DB',
    username: 'default',
    password: 'DsmgvPQTdR45',
    host: 'ep-divine-waterfall-24910907-pooler.us-east-1.postgres.vercel-storage.com',
    port: '5432',
    database: 'verceldb',
  },
];

export const MakeConnectionPage = ({
  onSuccessfulConnection,
}: ConnectionFormProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<
    DatabaseConnection | undefined
  >();
  const [connections, setConnections] =
    useState<DatabaseConnection[]>(previousConnections);

  const handleEdit = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setIsOpen(true);
  };

  const handleDelete = (connection: DatabaseConnection) => {
    setConnections(connections.filter((c) => c !== connection));
  };

  const handleNewConnection = () => {
    setSelectedConnection(undefined);
    setIsOpen(true);
  };

  return (
    <div className="w-full flex">
      <div className="w-1/2 h-lvh overflow-hidden">
        <HomeScreenCarousel />
      </div>
      <div className="w-1/2 relative">
        <div className="p-5">
          <SavedConnections
            connections={connections}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={(connection) => {
              setSelectedConnection(connection);
              setIsOpen(true);
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-5 bg-neutral-900">
          <button
            type="button"
            onClick={handleNewConnection}
            className="bg-violet-600 hover:bg-violet-700 flex grow items-center justify-center w-full gap-2 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            <Plus className="inline-block w-4 h-4" />
            New Connection
          </button>
        </div>

        <SlidePanel isOpen={isOpen} direction="right">
          <ConnectionForm
            connection={selectedConnection}
            onSuccessfulConnection={(connection) => {
              if (selectedConnection) {
                // Update existing connection
                setConnections(
                  connections.map((c) =>
                    c === selectedConnection ? connection : c,
                  ),
                );
              } else {
                // Add new connection
                setConnections([...connections, connection]);
              }
              onSuccessfulConnection(connection);
            }}
          />
        </SlidePanel>
      </div>
    </div>
  );
};
