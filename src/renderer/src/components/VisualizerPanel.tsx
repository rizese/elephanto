import { useReactFlow, Panel } from '@xyflow/react';
import { Node } from '@xyflow/react';
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Shrink,
  Expand,
  X,
  SquareTerminal,
  CircleChevronLeft,
} from 'lucide-react';
import { useAppContext } from './AppContextProvider';

interface NodeData {
  label?: string;
  [key: string]: any;
}

interface VisualizerPanelProps {
  nodes: Node<NodeData>[];
}

export const VisualizerPanel: React.FC<VisualizerPanelProps> = ({
  nodes,
}: VisualizerPanelProps) => {
  const { setCenter, zoomTo, getZoom, fitView } = useReactFlow();
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

  return (
    <Panel
      position="top-center"
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg  mx-0 py-2 px-3"
    >
      <div className="flex flex-row gap-1 items-center">
        <button
          onClick={() => handleZoom(-0.2)}
          className=" rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Zoom out"
        >
          <SquareTerminal className="w-7 h-7 p-1" />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className=" rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-7 h-7 p-1" />
        </button>
        <button
          onClick={() => handleZoom(0.2)}
          className=" rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-7 h-7 p-1" />
        </button>
        <button
          onClick={() => fitView({ duration: 800 })}
          className=" rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Fit view"
        >
          <Shrink className="w-7 h-7 p-1" />
        </button>
        <button
          onClick={() => zoomTo(1, { duration: 800 })}
          className=" rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Reset zoom"
        >
          <Expand className="w-7 h-7 p-1" />
        </button>
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
      <div className="flex flex-row gap-1 items-center">
        <button
          onClick={() =>
            setState((prev) => ({
              ...prev,
              connection: undefined,
            }))
          }
        >
          <CircleChevronLeft className="w-7 h-7 p-1" />
        </button>
      </div>
    </Panel>
  );
};
