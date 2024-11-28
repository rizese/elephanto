import { ConnectionForm } from './page/Connection'

export function App(): JSX.Element {
  const handleConnect = (): void => {
    debugger // time to move into connection view
  }

  return <ConnectionForm onSuccessfulConnection={handleConnect} />
}
