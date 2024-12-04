import React, { useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  MarkerType,
  Handle,
  MiniMap
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface Column {
  name: string
  dataType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isForeignKey: boolean
  references?: {
    table: string
    column: string
  }
}

interface Table {
  name: string
  schema: string
  columns: Column[]
}

interface SchemaVisualizerProps {
  tables: Table[]
}

const TableNode = ({ data }) => {
  return (
    <div className="bg-white dark:bg-zinc-700 border-1 border-zinc-300 rounded-lg shadow-lg p-4 min-w-[250px]">
      {/* Source handle at top */}
      <Handle
        type="source"
        position={Position.Top}
        id={`${data.label}-source`}
        style={{ opacity: 0 }}
      />

      <div className="border-1 dark:border-zinc-200 pb-2 mb-2">
        <h3 className="font-bold text-lg">{data.label}</h3>
        <p className="text-sm text-gray-600">{data.schema}</p>
      </div>
      <div className="space-y-1">
        {data.columns.map((column: Column, index: number) => (
          <div key={index} className="flex  font-mono space-between text-sm">
            <span className={` flex-1 ${column.isPrimaryKey ? 'font-bold' : ''}`}>
              {column.name}
            </span>
            <span className={`text-gray-400 text-xs ${column.isNullable && 'italic'}`}>
              {column.isPrimaryKey && '🔑 '}
              {column.isForeignKey && '🔗 '}
              {column.dataType}
            </span>
          </div>
        ))}
      </div>

      {/* Target handle at bottom */}
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${data.label}-target`}
        style={{ opacity: 0 }}
      />
    </div>
  )
}

const nodeTypes = {
  tableNode: TableNode
}

export const SchemaVisualizer = ({ tables }: SchemaVisualizerProps): JSX.Element => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    tables.forEach((table, index) => {
      const nodeId = `${table.schema}.${table.name}`
      nodes.push({
        id: nodeId,
        type: 'tableNode',
        position: { x: (index % 3) * 350, y: Math.floor(index / 3) * 400 },
        data: {
          label: table.name,
          schema: table.schema,
          columns: table.columns
        }
      })

      // Create edges for foreign key relationships
      table.columns.forEach((column) => {
        if (column.isForeignKey && column.references) {
          const sourceId = nodeId
          const targetId = `${table.schema}.${column.references.table}`
          const edgeId = `${sourceId}-${column.name}-${targetId}`

          edges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            sourceHandle: `${table.name}-source`,
            targetHandle: `${column.references.table}-target`,
            label: `${column.name} → ${column.references.column}`,
            type: 'smoothstep',
            animated: true,
            markerEnd: MarkerType.ArrowClosed,
            style: {
              strokeWidth: 2,
              stroke: '#666'
            },
            labelBgStyle: {
              fill: 'white',
              fillOpacity: 0.8,
              stroke: '#666'
            },
            labelStyle: {
              fill: '#666',
              fontSize: 12,
              fontWeight: 500
            }
          })
        }
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [tables])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-[800px]">
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
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default SchemaVisualizer
