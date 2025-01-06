// import { MakeConnectionPage } from './page/MakeConnection'
import { SchemaVisualizerPage } from './page/SchemaVisualizerPage'

// const MS_CONNECTION_STRING = 'postgresql://postgres:magicstory@localhost:5432/postgres'
const SP_CONNECTION_STRING = 'postgresql://spara:spara_dev@localhost:5432/spara_local'

export function App(): JSX.Element {
  const handleConnect = (): void => {
    debugger // time to move into connection view
  }

  // return <MakeConnectionPage onSuccessfulConnection={handleConnect} />
  return <SchemaVisualizerPage connectionString={SP_CONNECTION_STRING} />
}
