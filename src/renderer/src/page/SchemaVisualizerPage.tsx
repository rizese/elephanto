import { useEffect, useState } from 'react'
import { SchemaVisualizer } from './Visualizer' // Renamed from SchemaViewer

export interface Column {
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

export interface Table {
  name: string
  schema: string
  columns: Column[]
}

export const SchemaVisualizerPage = ({
  connectionString
}: {
  connectionString: string
}): JSX.Element => {
  const [tables, setTables] = useState<Table[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        // Connect to database
        const connectionResult = await window.electronAPI.database.connect(connectionString)
        if (!connectionResult.success) {
          throw new Error(connectionResult.error || 'Failed to connect to database')
        }

        // Get schemas
        const schemasResult = await window.electronAPI.database.getSchemas()

        if (!schemasResult.success || !schemasResult.schemas) {
          throw new Error(schemasResult.error || 'Failed to fetch schemas')
        }

        const tablesData: Table[] = []

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

            const columns: Column[] = structureResult.structure.map((col) => ({
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

  return (
    <div className="h-screen w-full">
      <SchemaVisualizer tables={tables} />
    </div>
  )
}
