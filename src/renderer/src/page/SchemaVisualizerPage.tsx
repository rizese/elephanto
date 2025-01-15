import { useEffect, useState } from 'react';
import { SchemaVisualizer } from './Visualizer'; // Renamed from SchemaViewer
import { DatabaseConnection } from '@renderer/types/settings';
import { getConnectionStringForDisplay } from '@renderer/App';
import { quantum } from 'ldrs';
import SlidePanel from '@renderer/components/SlidePanel';
import { useAppContext } from '@renderer/components/AppContextProvider';
import { CircleArrowUp, X } from 'lucide-react';
import AutoSizeTextArea from '@renderer/components/AutoSizeTextArea';

export interface Column {
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

export interface Table {
  name: string;
  schema: string;
  columns: Column[];
}

export const SchemaVisualizerPage = ({
  connection,
}: {
  connection: DatabaseConnection;
}): JSX.Element => {
  const [tables, setTables] = useState<Table[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    appState: { showChat },
    setState,
  } = useAppContext();

  const connectionString = getConnectionStringForDisplay(connection);

  quantum.register();

  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        // Connect to database
        const connectionResult =
          await window.electronAPI.database.connect(connectionString);
        if (!connectionResult.success) {
          throw new Error(
            connectionResult.error || 'Failed to connect to database',
          );
        }

        // Get schemas
        const schemasResult = await window.electronAPI.database.getSchemas();

        if (!schemasResult.success || !schemasResult.schemas) {
          throw new Error(schemasResult.error || 'Failed to fetch schemas');
        }

        const tablesData: Table[] = [];

        // For each schema, get tables and their details
        for (const schemaInfo of schemasResult.schemas) {
          const tablesResult = await window.electronAPI.database.getTables(
            schemaInfo.schema_name,
          );
          if (!tablesResult.success || !tablesResult.tables) continue;
          // For each table, get structure and relations
          for (const tableInfo of tablesResult.tables) {
            const [structureResult, relationsResult] = await Promise.all([
              window.electronAPI.database.getTableStructure(
                schemaInfo.schema_name,
                tableInfo.table_name,
              ),
              window.electronAPI.database.getRelations(
                schemaInfo.schema_name,
                tableInfo.table_name,
              ),
            ]);

            if (!structureResult.success || !structureResult.structure)
              continue;

            const columns: Column[] = structureResult.structure.map((col) => ({
              name: col.column_name,
              dataType: col.data_type,
              isNullable: col.is_nullable === 'YES',
              isPrimaryKey: col.is_primary_key,
              isForeignKey: col.is_foreign_key,
            }));

            // Add foreign key references
            if (relationsResult.success && relationsResult.relations) {
              relationsResult.relations.forEach((relation) => {
                const column = columns.find(
                  (col) => col.name === relation.column_name,
                );
                if (column) {
                  column.references = {
                    table: relation.foreign_table_name,
                    column: relation.foreign_column_name,
                  };
                }
              });
            }
            tablesData.push({
              name: tableInfo.table_name,
              schema: schemaInfo.schema_name,
              columns,
            });
          }
        }

        setTables(tablesData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching schema data',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemaData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <l-quantum size="70" speed="1.8" color="white"></l-quantum>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full animate-[fadeIn_500ms_ease-in]">
      <SchemaVisualizer tables={tables} />
      <SlidePanel
        isOpen={showChat}
        className="w-1/2 max-w-lg h-full bg-transparent dark:bg-transparent"
        direction="right"
      >
        <div className="absolute top-0 right-0 z-10 flex justify-end pb-0">
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
            <button className="bg-violet-500 text-white rounded-lg px-4 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700">
              <CircleArrowUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
