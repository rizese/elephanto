import { useReactFlow, Panel } from '@xyflow/react'

const TableSelectZoom = ({ nodes }) => {
  const { setCenter, zoomTo } = useReactFlow()

  const handleZoom100 = () => {
    zoomTo(1)
  }

  const handleNodeSelect = (event) => {
    const nodeId = event.target.value
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      setCenter(node.position.x + 125, node.position.y + 100, { zoom: 1, duration: 800 })
    }
  }

  return (
    <Panel position="top-center" className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleZoom100}
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
        >
          Reset Zoom (100%)
        </button>

        <div className="relative">
          <select
            onChange={handleNodeSelect}
            className="w-full appearance-none bg-gray-50 dark:bg-neutral-700 border rounded px-2 py-1 pr-8 text-sm"
          >
            <option value="">Center on node...</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.data?.label || node.id}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Panel>
  )
}

export default TableSelectZoom
