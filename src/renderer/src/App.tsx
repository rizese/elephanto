import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): JSX.Element {
  // src/renderer/src/App.tsx
  // Add this to your existing App.tsx where the "Send IPC" button is
  const testConnection = async (): Promise<void> => {
    try {
      // Test connection string - replace with your actual database
      const connectionString = 'postgresql://postgres:magicstory@localhost:5432/postgres'

      console.log('Testing connection...')
      const result = await window.electronAPI.database.connect(connectionString)

      if (result.success) {
        console.log('Connection successful:', result.version)

        // Test query
        const queryResult = await window.electronAPI.database.testQuery()
        console.log('Query result:', queryResult)
      } else {
        console.error('Connection failed:', result.error)
      }
    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={testConnection}>
            Test DB Connection
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
