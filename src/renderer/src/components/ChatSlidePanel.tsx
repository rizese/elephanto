import { elephantoGradient } from '@renderer/constants';
import { MessageSquareCode, X, CircleArrowUp } from 'lucide-react';
import { useAppContext } from './AppContextProvider';
import AutoSizeTextArea from './AutoSizeTextArea';
import SlidePanel from './SlidePanel';

export function ChatSlidePanel() {
  const {
    appState: { showChat },
    setState,
  } = useAppContext();
  return (
    <>
      <SlidePanel
        isOpen={showChat}
        className="w-1/2 max-w-lg h-full bg-transparent dark:bg-transparent"
        direction="right"
      >
        <div className="absolute top-0 -left-12 pt-5 z-10">
          <button
            className={`p-3 ${elephantoGradient} rounded-l-xl transition-opacity duration-300 ${showChat ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => setState((prev) => ({ ...prev, showChat: true }))}
          >
            <MessageSquareCode className="w-6 h-6 inline-block" />
          </button>
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

              <div className="chat-bubble">Welcome back.</div>
            </div>
          </div>
          <div className="flex flew-row gap-2">
            <AutoSizeTextArea
              className="w-full flex-1 focus:outline-none focus:shadow-none focus:ring-violet-500 rounded-lg bg-transparent"
              placeholder="Ask me anything about the schema"
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
