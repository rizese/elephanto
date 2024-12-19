import { useState } from 'react';
import { HomeScreenCarousel } from '../components/HomeScreenCarousel';
import FadeOut from '../components/FadeOut';
import { DatabaseConnection } from '@renderer/types/settings';
import {
  Check,
  CircleAlert,
  CircleChevronLeft,
  CirclePlus,
} from 'lucide-react';
import {
  getConnectionString,
  getConnectionStringForDisplay,
} from '@renderer/App';
import SlidePanel from '@renderer/components/SlidePanel';

interface ConnectionFormProps {
  onSuccessfulConnection: (connection: DatabaseConnection) => void;
}

type ConnectionResult = {
  success: boolean;
  version?: string;
  error?: string;
  serverVersion?: string;
};

const previousConnections: string[] = [
  'postgresql://postgres:magicstory@localhost:5432/postgres',
  'postgresql://spara:spara_dev@localhost:5432/spara_local',
  'postgresql://default:DsmgvPQTdR45@ep-divine-waterfall-24910907-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb',
];

export const MakeConnectionPage = ({
  onSuccessfulConnection,
}: ConnectionFormProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full flex">
      <div className="w-1/2 h-lvh overflow-hidden">
        <HomeScreenCarousel />
      </div>
      <div className="w-1/2 relative">
        <div className="p-5 flex flex-col gap-2">
          {previousConnections.map((connection) => (
            <div key={connection}>
              <div className="truncate p-5 rounded-md border border-zinc-800">
                {connection}
              </div>
            </div>
          ))}
          <button
            className="flex gap-2 items-center"
            onClick={() => setIsOpen(true)}
          >
            <CirclePlus className="inline-block" />
            New Connection
          </button>
        </div>
        <SlidePanel isOpen={isOpen} direction="right">
          {previousConnections.length > 0 && (
            <button className="p-5 pb-0" onClick={() => setIsOpen(false)}>
              <CircleChevronLeft className="inline-block" /> Back
            </button>
          )}
          <NewConnectionForm onSuccessfulConnection={onSuccessfulConnection} />
        </SlidePanel>
      </div>
    </div>
  );
};

const NewConnectionForm = ({
  onSuccessfulConnection,
}: ConnectionFormProps): JSX.Element => {
  const [formData, setFormData] = useState<DatabaseConnection>({
    host: 'localhost',
    port: '5432',
    database: 'postgres',
    username: 'postgres',
    password: '',
    name: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when form changes
    setError('');
    setTestMessage('');
  };

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    setIsConnecting(true);
    setError('');

    try {
      const connectionString = getConnectionString(formData);
      const result: ConnectionResult =
        await window.electronAPI.database.connect(connectionString);
      console.log({ result });

      if (result.success) {
        console.log('Connected to PostgreSQL version:', result.version);
        onSuccessfulConnection(formData);
      } else {
        setError(
          result.error
            ? result.error
            : 'No Postgres server found at that location',
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTest = async (): Promise<void> => {
    setIsTesting(true);
    setTestMessage('');
    setError('');

    try {
      const result = await window.electronAPI.database.connect(
        getConnectionString(formData),
      );
      if (result.success) {
        setTestMessage('Connection successful!');
      } else {
        setError(
          result.error?.split(':').pop()?.trim() || 'Test connection failed',
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test connection failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyConnectionString = (): void => {
    navigator.clipboard.writeText(getConnectionStringForDisplay(formData));
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 p-5 flex flex-col">
        <div>
          <label className="block">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="border p-2 rounded w-full dark:bg-zinc-800"
          />
        </div>

        <div className="relative">
          <label className="block">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="•••••••"
            className="border p-2 rounded w-full dark:bg-zinc-800 pr-10"
          />
          {formData.password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 py-2.5 px-3 text-sm "
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
        <div>
          <label className="block">Host</label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleChange}
            className="p-2 rounded w-full dark:bg-zinc-800"
          />
        </div>

        <div>
          <label className="block">Port</label>
          <input
            type="text"
            name="port"
            value={formData.port}
            onChange={handleChange}
            className="border p-2 rounded w-full dark:bg-zinc-800"
          />
        </div>

        <div>
          <label className="block">Database</label>
          <input
            type="text"
            name="database"
            value={formData.database}
            onChange={handleChange}
            className="border p-2 rounded w-full dark:bg-zinc-800"
          />
        </div>

        <div className="relative">
          <label className="block">Connection String</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={getConnectionStringForDisplay(formData)}
              onClick={handleCopyConnectionString}
              readOnly
              disabled
              className="border p-2 rounded w-full bg-gray-50 dark:bg-zinc-600 cursor-pointer font-mono"
            />
          </div>
        </div>
      </form>
      <div className="absolute bottom-0 w-full p-5 bg-neutral-900">
        <div>
          {error && (
            <FadeOut time={2000}>
              <div className="text-red-800 italic pb-3 uppercase flex items-center">
                <CircleAlert className="w-4 h-4 mr-1 inline-block" />
                {error}
              </div>
            </FadeOut>
          )}
          {testMessage && (
            <FadeOut time={2000}>
              <div className="italic pb-3">
                <Check className="w-4 h-4 mr-1 text-green-700 inline-block" />
                {testMessage}
              </div>
            </FadeOut>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="bg-slate-600 w-1/6 text-white py-2 rounded disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test'}
          </button>
          <button
            type="submit"
            disabled={isConnecting}
            onClick={handleSubmit}
            className="bg-violet-600 grow text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </>
  );
};
