import { useCallback, useLayoutEffect } from 'react';
import {
  ReactFlow,
  Node as FlowNode,
  Edge as FlowEdge,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  MarkerType,
  Handle,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { KeyRound, Link } from 'lucide-react';
import {
  ExitButton,
  StatusButton,
  VisualizerPanel,
} from '@renderer/components/VisualizerPanel';

interface Column {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

interface Table {
  name: string;
  schema: string;
  columns: Column[];
}

interface SchemaVisualizerProps {
  tables: Table[];
}

interface NodeData extends Record<string, unknown> {
  label: string;
  schema: string;
  columns: Column[];
}

type VisualizerNode = FlowNode<NodeData>;

const mapDataType = (dataType: string) => {
  const map = {
    'character varying': 'varchar',
    character: 'char',
    'timestamp without time zone': 'datetime',
  };
  return map[dataType] || dataType;
};

const TableNode = ({ data }) => {
  return (
    <div className="bg-white dark:bg-zinc-700 border-1 border-zinc-300 rounded-lg shadow-lg p-4 min-w-[250px]">
      {/* Multiple handles on all sides */}
      <Handle
        type="source"
        position={Position.Top}
        id={`${data.label}-top`}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${data.label}-right`}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${data.label}-bottom`}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id={`${data.label}-left`}
        style={{ opacity: 0 }}
      />

      <div className="border-1 dark:border-zinc-200 pb-2 mb-2">
        <h2 className="font-bold text-lg">{data.label}</h2>
        <p className="text-sm text-gray-400">{data.schema}</p>
      </div>
      <div className="space-y-1">
        {data.columns.map((column: Column, index: number) => (
          <div
            key={index}
            className="flex hover:bg-gray-100 dark:hover:bg-neutral-600 font-mono space-between text-sm leading-4"
          >
            <span
              className={`flex-1 pr-5  dark:hover:bg-neutral-600 ${
                column.isPrimaryKey ? 'font-bold' : ''
              }`}
            >
              {column.name}
              {column.isNullable && (
                <span className="font-light text-gray-400">?</span>
              )}
            </span>
            <span className={`text-gray-400 text-xs`}>
              {column.isPrimaryKey && (
                <KeyRound className="inline pr-1 h-4 w-4" />
              )}
              {column.isForeignKey && <Link className="inline pr-1 h-4 w-4" />}
              {mapDataType(column.dataType).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

const getLayoutedElements = (
  nodes: VisualizerNode[],
  edges: FlowEdge[],
  direction = 'TB',
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 250;
  const nodeHeight = 300;
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 200,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Calculate smart handle positions for edges
  const layoutedEdges = edges.map((edge) => {
    const sourceNode = dagreGraph.node(edge.source);
    const targetNode = dagreGraph.node(edge.target);

    // Calculate the direction between nodes
    const deltaX = targetNode.x - sourceNode.x;
    const deltaY = targetNode.y - sourceNode.y;

    // Determine best handle positions based on relative positions
    let sourcePos: Position;
    let targetPos: Position;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Vertical alignment is stronger
      sourcePos = deltaY > 0 ? Position.Bottom : Position.Top;
      targetPos = deltaY > 0 ? Position.Top : Position.Bottom;
    } else {
      // Horizontal alignment is stronger
      sourcePos = deltaX > 0 ? Position.Right : Position.Left;
      targetPos = deltaX > 0 ? Position.Left : Position.Right;
    }

    return {
      ...edge,
      sourceHandle: `${edge.source.split('.')[1]}-${sourcePos.toLowerCase()}`,
      targetHandle: `${edge.target.split('.')[1]}-${targetPos.toLowerCase()}`,
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export const SchemaVisualizer = ({
  tables,
}: SchemaVisualizerProps): JSX.Element => {
  const getNodesAndEdges = useCallback(() => {
    const nodes: VisualizerNode[] = [];
    const edges: FlowEdge[] = [];

    tables.forEach((table) => {
      const nodeId = `${table.schema}.${table.name}`;
      nodes.push({
        id: nodeId,
        type: 'tableNode',
        position: { x: 0, y: 0 },
        data: {
          label: table.name,
          schema: table.schema,
          columns: table.columns,
        },
      });

      table.columns.forEach((column) => {
        if (column.isForeignKey && column.references) {
          const sourceId = nodeId;
          const targetId = `${table.schema}.${column.references.table}`;
          const edgeId = `${sourceId}-${column.name}-${targetId}`;

          edges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            label: `${column.name} → ${column.references.column}`,
            // type: 'bezier',
            animated: true,
            markerEnd: MarkerType.ArrowClosed,
            style: {
              strokeWidth: 2,
              stroke: '#666',
            },
            labelBgStyle: {
              fill: 'white',
              fillOpacity: 0.8,
              stroke: '#666',
            },
            labelStyle: {
              fill: '#666',
              fontSize: 12,
              fontWeight: 500,
            },
          });
        }
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
    );
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [tables]);

  const [nodes, setNodes, onNodesChange] = useNodesState<VisualizerNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);

  useLayoutEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getNodesAndEdges();
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [getNodesAndEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background />
        <VisualizerPanel nodes={nodes} />
        <ExitButton />
        <StatusButton />
      </ReactFlow>
    </div>
  );
};

export default SchemaVisualizer;
