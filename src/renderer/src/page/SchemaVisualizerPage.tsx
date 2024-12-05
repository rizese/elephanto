import { useEffect, useState } from 'react'
import { SchemaVisualizer } from './Visualizer' // Renamed from SchemaViewer

interface TableData {
  name: string
  schema: string
  columns: Array<{
    name: string
    dataType: string
    isNullable: boolean
    isPrimaryKey: boolean
    isForeignKey: boolean
    references?: {
      table: string
      column: string
    }
  }>
}

export const SchemaVisualizerPage = (): JSX.Element => {
  const [tables, setTables] = useState<TableData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // const CONNECTION_STRING = 'postgresql://postgres:magicstory@localhost:5432/postgres'
  const CONNECTION_STRING = 'postgresql://spara:spara_dev@localhost:5432/spara_local'

  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        // Connect to database
        const connectionResult = await window.electronAPI.database.connect(CONNECTION_STRING)
        if (!connectionResult.success) {
          throw new Error(connectionResult.error || 'Failed to connect to database')
        }

        // Get schemas
        const schemasResult = await window.electronAPI.database.getSchemas()

        if (!schemasResult.success || !schemasResult.schemas) {
          throw new Error(schemasResult.error || 'Failed to fetch schemas')
        }

        const tablesData: TableData[] = []

        // For each schema, get tables and their details
        for (const schemaInfo of schemasResult.schemas) {
          const tablesResult = await window.electronAPI.database.getTables(schemaInfo.schema_name)
          if (!tablesResult.success || !tablesResult.tables) continue
          // For each table, get structure and relations
          for (const tableInfo of tablesResult.tables) {
            const [structureResult, relationsResult] = await Promise.all([
              window.electronAPI.database.getTableStructure(
                schemaInfo.schema_name,
                tableInfo.table_name
              ),
              window.electronAPI.database.getRelations(schemaInfo.schema_name, tableInfo.table_name)
            ])

            if (!structureResult.success || !structureResult.structure) continue

            const columns = structureResult.structure.map((col) => ({
              name: col.column_name,
              dataType: col.data_type,
              isNullable: col.is_nullable === 'YES',
              isPrimaryKey: col.is_primary_key,
              isForeignKey: col.is_foreign_key
            }))

            // Add foreign key references
            if (relationsResult.success && relationsResult.relations) {
              relationsResult.relations.forEach((relation) => {
                const column = columns.find((col) => col.name === relation.column_name)
                if (column) {
                  column.references = {
                    table: relation.foreign_table_name,
                    column: relation.foreign_column_name
                  }
                }
              })
            }
            tablesData.push({
              name: tableInfo.table_name,
              schema: schemaInfo.schema_name,
              columns
            })
          }
        }

        setTables(tablesData)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fetching schema data'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchemaData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading schema...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }
  console.log({ tables })

  return (
    <div className="h-screen w-full">
      {/* {tables.map((table, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold">{table.name}</h3>
          <ul>
            {table.columns.map((column, colIndex) => (
              <li key={colIndex} className="ml-4">
                {column.name} ({column.type})
                {column.references && (
                  <span className="text-sm text-gray-600">
                    {' '}
                    - references {column.references.table}({column.references.column})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))} */}
      <SchemaVisualizer tables={tables} />
    </div>
  )
}
