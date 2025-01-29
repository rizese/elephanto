import { useReactFlow, Panel } from '@xyflow/react';
import { Node } from '@xyflow/react';
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { useState } from 'react';
import { ZoomIn, ZoomOut, X, CircleChevronLeft } from 'lucide-react';
import { useAppContext } from './AppContextProvider';
import { panelBackground } from '@renderer/constants';

interface NodeData {
  label?: string;
  [key: string]: any;
}

interface VisualizerPanelProps {
  nodes: Node<NodeData>[];
}

const ZoomFit = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_1_7)">
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.17158 8.17157L13.8284 13.8284"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 13.8284L13.8284 13.8284L13.8284 11"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8L10.8284 8"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8V10.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_7">
        <rect width={24} height={24} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ZoomActual = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21 21L16.65 16.65M11 14V8L9.5 9.5M9 14H13M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VisualizerPanel: React.FC<VisualizerPanelProps> = ({
  nodes,
}: VisualizerPanelProps) => {
  const { setCenter, zoomTo, getZoom, fitView } = useReactFlow();
  const { setState } = useAppContext();
  const [query, setQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const filteredNodes =
    query === ''
      ? nodes
      : nodes.filter((node) =>
          (node.data?.label || node.id)
            .toLowerCase()
            .includes(query.toLowerCase()),
        );

  const handleZoom = (delta: number): void => {
    zoomTo(getZoom() + delta, { duration: 300 });
  };

  const handleNodeSelect = (node: Node<NodeData>): void => {
    if (node) {
      setSelectedNode(node);
      setCenter(node.position.x + 125, node.position.y + 100, {
        zoom: 1,
        duration: 800,
      });
    }
  };

  const iconClass = 'w-8 h-8 p-1 mt-0.5';
  const icons = [
    {
      icon: <ZoomIn className={iconClass} />,
      label: 'Zoom in',
      onClick: () => handleZoom(0.2),
    },
    {
      icon: <ZoomOut className={iconClass} />,
      label: 'Zoom out',
      onClick: () => handleZoom(-0.2),
    },
    {
      icon: <ZoomFit className={iconClass} />,
      label: 'Zoom to fit',
      onClick: () => fitView({ duration: 800 }),
    },
    {
      icon: <ZoomActual className={iconClass} />,
      label: 'Zoom to 100%',
      onClick: () => zoomTo(1, { duration: 800 }),
    },
  ] as const;

  return (
    <Panel
      position="top-center"
      className={`${panelBackground} mx-0 py-2 px-3`}
    >
      <div className="flex flex-row gap-1 items-center justify-center align-center">
        {icons.map(({ icon, label, onClick }) => (
          <div
            className="leading-none tooltip tooltip-bottom tooltip-accent"
            key={label}
            data-tip={label}
          >
            <button
              onClick={onClick}
              className="rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
              aria-label={label}
            >
              {icon}
            </button>
          </div>
        ))}
        <div className="relative w-48 ml-1">
          <Combobox value={selectedNode} immediate onChange={handleNodeSelect}>
            {selectedNode && (
              <X
                className="w-4 h-4 absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 dark:text-neutral-400 cursor-pointer"
                onClick={() => {
                  setSelectedNode(null);
                  setQuery('');
                }}
              />
            )}
            <ComboboxInput
              className="w-full bg-gray-50 dark:bg-neutral-700 border rounded px-2 py-1 text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Go to table"
              displayValue={(node: Node<NodeData> | null) =>
                node?.data?.label || node?.id || ''
              }
              spellCheck={false}
            />
            <ComboboxOptions
              transition
              className="absolute z-10 w-auto bg-white dark:bg-neutral-700 mt-1 rounded shadow-lg max-h-48 overflow-x-hidden overflow-y-auto"
            >
              {filteredNodes.map((node) => (
                <ComboboxOption
                  key={node.id}
                  value={node}
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-4 ${
                      active
                        ? 'data-[focus]:bg-blue-500 data-[focus]:text-white'
                        : 'text-gray-900 dark:text-white'
                    }`
                  }
                >
                  {node.data?.label || node.id}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </div>
      </div>
    </Panel>
  );
};

export const ExitButton = () => {
  const { setState } = useAppContext();
  return (
    <Panel
      position="top-left"
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg  mx-0 py-2 px-2"
    >
      <div className="flex flex-row gap-1 items-center justify-center align-center">
        <div
          className="leading-none tooltip tooltip-right tooltip-accent"
          data-tip="Close connection"
        >
          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                connection: undefined,
              }))
            }
          >
            <CircleChevronLeft className="w-7 h-7 p-1 mt-0.5" />
          </button>
        </div>
      </div>
    </Panel>
  );
};
