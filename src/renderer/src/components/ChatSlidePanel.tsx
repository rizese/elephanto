import { elephantoGradient } from '@renderer/constants';
import { MessageSquareCode, X, CircleArrowUp } from 'lucide-react';
import { useAppContext } from './AppContextProvider';
import AutoSizeTextArea from './AutoSizeTextArea';
import SlidePanel from './SlidePanel';
import MarkdownText from './MarkdownText';

export function ChatSlidePanel() {
  const { appState, setState } = useAppContext();
  const { showChat, connection } = appState;

  if (!connection) {
    return null;
  }

  return (
    <>
      <SlidePanel
        isOpen={showChat}
        className="w-1/2 max-w-lg h-full bg-transparent dark:bg-transparent"
        direction="right"
      >
        <div className="absolute top-0 -left-12 pt-5 z-10">
          <div
            className={showChat ? '' : 'leading-none tooltip tooltip-left '}
            data-tip={'Open chat'}
          >
            <button
              className={`p-3 ${elephantoGradient} rounded-l-xl transition-opacity duration-300 ${showChat ? 'opacity-0' : 'opacity-100'}`}
              onClick={() => setState((prev) => ({ ...prev, showChat: true }))}
            >
              <MessageSquareCode className="w-6 h-6 inline-block" />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 z-10  pb-0">
          <button
            className="p-5 pb-0"
            onClick={() => setState((prev) => ({ ...prev, showChat: false }))}
          >
            <X className="inline-block" />
          </button>
        </div>
        <div className="h-full rounded-2xl flex flex-col  bg-zinc-100 dark:bg-zinc-850 p-4">
          <div className="flex-1 flex flex-col gap-4">
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10">
                  <img alt="Elephanto" src="src/assets/icon.png" />
                </div>
              </div>

              <div className="chat-bubble mt-1">Welcome back.</div>
              <div className="chat-bubble mt-1">
                <MarkdownText
                  text={`We're connected to \`${connection.host}\` and viewing the schema for the \`${connection.database}\` database.`}
                />
              </div>
            </div>
          </div>
          <div className="flex flew-row gap-2">
            <AutoSizeTextArea
              className="w-full flex-1 focus:outline-none focus:shadow-none focus:ring-violet-500 rounded-lg bg-transparent"
              placeholder={`Ask me anything about ${connection.name}`}
            />
            <button
              className={`text-white rounded-lg px-4 ${elephantoGradient}`}
            >
              <CircleArrowUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      </SlidePanel>
    </>
  );
}
