import { useState } from 'react';
import { ElephantoScreen } from '../components/ElephantoScreen';
import { DatabaseConnection } from 'src/types/electronAPI';
import SlidePanel from '@renderer/components/SlidePanel';
import { ConnectionForm } from '@renderer/components/ConnectionForm';
import { SavedConnections } from '@renderer/components/SavedConnections';
import { CircleAlert, Plus, X } from 'lucide-react';
import { getConnectionString } from '@renderer/App';
import FadeOut from '@renderer/components/FadeOut';
// import { ConnectionsDump } from './ConnectionsDump';

export type ConnectionResult = {
  success: boolean;
  version?: string;
  error?: string;
  serverVersion?: string;
};

const NewConnectionButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex grow items-center justify-center w-full gap-2 text-white px-4 py-2 rounded disabled:opacity-50 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600"
    >
      <Plus className="inline-block w-4 h-4" />
      New Connection
    </button>
  );
};

export const MakeConnectionPage = ({
  onSuccessfulConnection,
}: {
  onSuccessfulConnection: (connection: DatabaseConnection) => void;
}): JSX.Element => {
  const [isConnectionSlidePanelOpen, setConnectionSlidePanelOpen] =
    useState(false);
  const [selectedConnection, setSelectedConnection] = useState<
    DatabaseConnection | undefined
  >();
  const [error, setError] = useState<string>();

  const handleEdit = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setConnectionSlidePanelOpen(true);
  };

  const handleNewConnection = () => {
    setSelectedConnection(undefined);
    setConnectionSlidePanelOpen(true);
  };

  return (
    <div className="w-full flex">
      <div className="w-1/2 h-lvh overflow-hidden">
        <ElephantoScreen />
      </div>
      <div className="w-1/2 h-lvh overflow-hidden relative">
        <div className="p-5 h-full overflow-y-auto overflow-x-hidden pb-24">
          {error && (
            <FadeOut time={2000} onComplete={() => setError(undefined)}>
              <div className="text-red-800 italic pb-3 uppercase flex items-center">
                <CircleAlert className="w-4 h-4 mr-1 inline-block" />
                {error}
              </div>
            </FadeOut>
          )}
          {/* <ConnectionsDump /> */}
          <SavedConnections
            onEdit={handleEdit}
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
          <NewConnectionButton onClick={handleNewConnection} />
        </div>
        <SlidePanel
          isOpen={isConnectionSlidePanelOpen}
          direction="right"
          className="w-1/2"
        >
          <div className="flex justify-end pb-0">
            <button
              className="p-5 pb-0"
              onClick={() => setConnectionSlidePanelOpen(false)}
            >
              <X className="inline-block" />
            </button>
          </div>
          <ConnectionForm
            connection={selectedConnection}
            onSuccessfulConnection={(connection) => {
              onSuccessfulConnection(connection);
            }}
          />
        </SlidePanel>
      </div>
    </div>
  );
};
