import { useMemo } from 'react'
import {
  Node,
  Edge,
  Controls,
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
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
    onDelete?: string
    onUpdate?: string
  }
}

interface Table {
  name: string
  schema: string
  columns: Column[]
}

interface SchemaViewerProps {
  tables: Table[]
}

// Custom node component for tables
const TableNode = ({ data }) => {
  return (
    <div className="bg-white dark:bg-violet-950 rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="border-b-2 border-gray-200 pb-2 mb-2">
        <h3 className="font-bold text-lg">{data.label}</h3>
        <p className="text-sm text-gray-600">{data.schema}</p>
      </div>
      <div className="space-y-1">
        {data.columns.map((column: Column, index: number) => (
          <div key={index} className="flex items-center text-sm">
            <span className={`flex-1 ${column.isPrimaryKey ? 'font-bold' : ''}`}>
              {column.name}
            </span>
            <span className="text-gray-500 text-xs">
              {column.dataType}
              {column.isPrimaryKey && ' 🔑'}
              {column.isForeignKey && ' 🔗'}
              {!column.isNullable && ' *'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const nodeTypes = {
  tableNode: TableNode
}

export const SchemaVisualizer = ({ tables }: SchemaViewerProps): JSX.Element => {
  // Convert tables data to nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    const yOffset = 0

    // Create nodes for each table
    tables.forEach((table, index) => {
      nodes.push({
        id: `${table.schema}.${table.name}`,
        type: 'tableNode',
        position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 400 },
        data: {
          label: table.name,
          schema: table.schema,
          columns: table.columns
        }
      })

      // Create edges for foreign key relationships
      table.columns.forEach((column) => {
        if (column.isForeignKey && column.references) {
          edges.push({
            id: `${table.schema}.${table.name}.${column.name}-${column.references.table}.${column.references.column}`,
            source: `${table.schema}.${table.name}`,
            target: `${table.schema}.${column.references.table}`,
            label: `${column.name} → ${column.references.column}`,
            labelStyle: { fill: '#666', fontSize: 12 },
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#999' },
            data: {
              onDelete: column.references.onDelete,
              onUpdate: column.references.onUpdate
            }
          })
        }
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [tables])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  console.log({ tables, nodes, edges })

  // Optional: Add edge hover tooltip for showing cascade rules
  const EdgeTooltip = ({ data }) => (
    <div className="bg-white p-2 rounded shadow text-sm">
      {data.onDelete && <div>On Delete: {data.onDelete}</div>}
      {data.onUpdate && <div>On Update: {data.onUpdate}</div>}
    </div>
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.STRICT}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  )
}
