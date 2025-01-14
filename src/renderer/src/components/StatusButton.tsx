import { Panel } from '@xyflow/react';
import { useAppContext } from './AppContextProvider';

export const StatusButton = () => {
  const { appState: state, reconnect } = useAppContext();
  return (
    <Panel
      position="bottom-left"
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg  mx-0 py-2 px-2"
    >
      <div className="flex flex-row items-center p-1">
        <div>
          {state.isConnected ? (
            <div className="w-3 h-3 bg-green-500 shadow-md shadow-green-500/50 rounded-full" />
          ) : (
            <div className="w-3 h-3 bg-red-500 shadow-md shadow-red-500/50 rounded-full" />
          )}
        </div>
        <div>
          {!state.isConnected && (
            <button
              className="ml-3 bg-violet-500 text-white rounded-md px-2 py-1"
              onClick={() => reconnect()}
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
};
