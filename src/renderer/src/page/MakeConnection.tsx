import { useEffect, useState } from 'react';
import { ElephantoScreen } from '../components/ElephantoScreen';
import { DatabaseConnection } from '@renderer/types/settings';
import SlidePanel from '@renderer/components/SlidePanel';
import { ConnectionForm } from '@renderer/components/ConnectionForm';
import { SavedConnections } from '@renderer/components/SavedConnections';
import { Plus, X } from 'lucide-react';
import { getConnectionString } from '@renderer/App';
import { useSafeStorage } from '@renderer/hooks/useSafeStorage';

export type ConnectionResult = {
  success: boolean;
  version?: string;
  error?: string;
  serverVersion?: string;
};

const previousConnections: DatabaseConnection[] = [
  // {
  //   name: 'Local Postgres',
  //   username: 'postgres',
  //   password: 'magicstory',
  //   host: 'localhost',
  //   port: '5432',
  //   database: 'postgres',
  // },
  // {
  //   name: 'Local Spara',
  //   username: 'spara',
  //   password: 'spara_dev',
  //   host: 'localhost',
  //   port: '5432',
  //   database: 'spara_local',
  // },
  // {
  //   name: 'Vercel DB',
  //   username: 'default',
  //   password: 'DsmgvPQTdR45',
  //   host: 'ep-divine-waterfall-24910907-pooler.us-east-1.postgres.vercel-storage.com',
  //   port: '5432',
  //   database: 'verceldb',
  // },
];

export const MakeConnectionPage = ({
  onSuccessfulConnection,
}: {
  onSuccessfulConnection: (connection: DatabaseConnection) => void;
}): JSX.Element => {
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<
    DatabaseConnection | undefined
  >();
  const { decryptAndRetrieve } = useSafeStorage();
  const [connections, setConnections] = useState<DatabaseConnection[]>();
  const [error, setError] = useState<string>();

  const handleEdit = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setIsConnectionFormOpen(true);
  };

  const handleDelete = (connection: DatabaseConnection) => {
    // TODO: Implement
    console.log('handleDelete', connection);
  };

  const handleNewConnection = () => {
    setSelectedConnection(undefined);
    setIsConnectionFormOpen(true);
  };

  useEffect(() => {
    const getConnections = async () => {
      const connections =
        await decryptAndRetrieve<DatabaseConnection[]>('connections');
      if (connections?.data) {
        setConnections(connections.data);
      }
    };
    getConnections();
  }, []);

  return (
    <div className="w-full flex">
      <div
        className="w-1/2 h-lvh overflow-hidden"
        onClick={() => setPlayVideo((prev) => !prev)}
      >
        <ElephantoScreen playVideo={playVideo} />
      </div>
      <div className="w-1/2 relative">
        <div className="p-5">
          <SavedConnections
            onEdit={handleEdit}
            onDelete={handleDelete}
            error={error}
            clearError={() => setError(undefined)}
            onSelect={async (connection) => {
              try {
                const connectionString = getConnectionString(connection);
                const result =
                  await window.electronAPI.database.connect(connectionString);

                if (result.success) {
                  onSuccessfulConnection(connection);
                } else {
                  setError(result.error || 'Failed to connect to database');
                }
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : 'Failed to connect to database',
                );
              }
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-5 bg-neutral-900">
          <button
            type="button"
            onClick={handleNewConnection}
            className="flex grow items-center justify-center w-full gap-2 text-white px-4 py-2 rounded disabled:opacity-50 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600"
          >
            <Plus className="inline-block w-4 h-4" />
            New Connection
          </button>
        </div>

        <SlidePanel
          isOpen={isConnectionFormOpen}
          direction="right"
          className="w-1/2"
        >
          <div className="flex justify-end pb-0">
            <button
              className="p-5 pb-0"
              onClick={() => setIsConnectionFormOpen(false)}
            >
              <X className="inline-block" />
            </button>
          </div>
          <ConnectionForm
            connection={selectedConnection}
            // onSuccessfulConnection={(connection) => {
            //   debugger;
            //   if (selectedConnection) {
            //     // Update existing connection
            //     setConnections(
            //       connection.map((c) =>
            //         c === selectedConnection ? connection : c,
            //       ),
            //     );
            //   }
            //   onSuccessfulConnection(connection);
            // }}
          />
        </SlidePanel>
      </div>
    </div>
  );
};
