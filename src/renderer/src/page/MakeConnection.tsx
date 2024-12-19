import { useState } from 'react';
import { HomeScreenCarousel } from '../components/HomeScreenCarousel';
import { DatabaseConnection } from '@renderer/types/settings';
import SlidePanel from '@renderer/components/SlidePanel';
import { NewConnectionForm } from '@renderer/components/NewConnectionForm';

export interface ConnectionFormProps {
  onSuccessfulConnection: (connection: DatabaseConnection) => void;
}

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
  return (
    <div className="w-full flex">
      <div className="w-1/2 h-lvh overflow-hidden">
        <HomeScreenCarousel />
      </div>
      <div className="w-1/2 relative">
        <div className="p-5 flex flex-col gap-2">
          {previousConnections.map((connection, index) => (
            <button
              key={index}
              className="flex gap-2 w-full items-center truncate p-5 rounded-md border border-zinc-800 hover:bg-zinc-800"
              onClick={() => setIsOpen(true)}
            >
              <div className="">{connection.name}</div>
            </button>
          ))}
          <div className="absolute bottom-0 left-0 w-full p-5 bg-neutral-900">
            <button
              type="submit"
              onClick={() => setIsOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 flex grow items-center justify-center w-full gap-2 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              <Plus className="inline-block w-4 h-4" />
              New Connection
            </button>
          </div>
        </div>
        <SlidePanel isOpen={isOpen} direction="right">
          <div className="flex justify-end pb-0">
            <button className="p-5 pb-0" onClick={() => setIsOpen(false)}>
              <X className="inline-block" />
            </button>
          </div>
          <NewConnectionForm onSuccessfulConnection={onSuccessfulConnection} />
        </SlidePanel>
      </div>
    </div>
  );
};
