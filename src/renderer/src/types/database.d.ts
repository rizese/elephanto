// src/types/database.ts
export interface DatabaseAPI {
  connect: (connectionString: string) => Promise<{
    success: boolean
    version?: string
    serverVersion?: string
    error?: string
  }>

  getSchemas: () => Promise<{
    success: boolean
    schemas?: Array<{
      schema_name: string
      table_count: number
    }>
    error?: string
  }>

  getTables: (schema: string) => Promise<{
    success: boolean
    tables?: Array<{
      table_name: string
      column_count: number
      description: string | null
    }>
    error?: string
  }>

  getTableStructure: (
    schema: string,
    table: string
  ) => Promise<{
    success: boolean
    structure?: Array<{
      column_name: string
      data_type: string
      is_nullable: string
      column_default: string | null
      character_maximum_length: number | null
      column_description: string | null
      is_primary_key: boolean
      is_foreign_key: boolean
    }>
    error?: string
  }>

  getRelations: (
    schema: string,
    table: string
  ) => Promise<{
    success: boolean
    relations?: Array<{
      constraint_name: string
      table_schema: string
      table_name: string
      column_name: string
      foreign_table_schema: string
      foreign_table_name: string
      foreign_column_name: string
    }>
    error?: string
  }>

  executeQuery: (query: string) => Promise<{
    success: boolean
    rows?: any[]
    rowCount?: number
    fields?: Array<{
      name: string
      dataType: number
    }>
    error?: string
    position?: number
    detail?: string
    hint?: string
    code?: string
  }>
}

declare global {
  interface Window {
    electronAPI: {
      database: DatabaseAPI
    }
  }
}
