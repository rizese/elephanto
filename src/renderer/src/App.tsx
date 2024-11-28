import { MakeConnectionPage } from './page/MakeConnection'

export function App(): JSX.Element {
  const handleConnect = (): void => {
    debugger // time to move into connection view
  }

  return <MakeConnectionPage onSuccessfulConnection={handleConnect} />
}
