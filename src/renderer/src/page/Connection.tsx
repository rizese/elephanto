import { useState } from 'react'
import { HomeScreenCarousel } from '../components/HomeScreenCarousel'
import FadeOut from '../components/FadeOut'

interface ConnectionFormProps {
  onSuccessfulConnection: () => void
}

type ConnectionResult = {
  success: boolean
  version?: string
  error?: string
  serverVersion?: string
}

export const ConnectionForm = ({ onSuccessfulConnection }: ConnectionFormProps): JSX.Element => {
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: '5432',
    database: 'postgres',
    user: 'postgres',
    password: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const getConnectionStringForDisplay = (): string => {
    const password = showPassword ? formData.password : '*'.repeat(formData.password.length)
    return `postgresql://${formData.user}${(formData.user || formData.password) && ':'}${password}${(formData.user || formData.password) && '@'}${formData.host}:${formData.port}${formData.database && '/'}${formData.database}`
  }

  const getConnectionString = (): string => {
    return `postgresql://${formData.user}${(formData.user || formData.password) && ':'}${formData.password}${(formData.user || formData.password) && '@'}${formData.host}:${formData.port}${formData.database && '/'}${formData.database}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when form changes
    setError('')
    setTestMessage('')
  }

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault()
    setIsConnecting(true)
    setError('')

    try {
      const connectionString = getConnectionString()
      const result: ConnectionResult = await window.electronAPI.database.connect(connectionString)
      console.log({ result })

      if (result.success) {
        console.log('Connected to PostgreSQL version:', result.version)
        onSuccessfulConnection()
      } else {
        setError(result.error ? result.error : 'No Postgres server found at that location')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTest = async (): Promise<void> => {
    setIsTesting(true)
    setTestMessage('')
    setError('')

    try {
      await window.electronAPI.database.connect(getConnectionStringForDisplay())
      setTestMessage('Connection successful!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test connection failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleCopyConnectionString = (): void => {
    navigator.clipboard.writeText(getConnectionStringForDisplay())
  }

  return (
    <div className="w-full flex">
      <div className="w-1/2 h-lvh">
        <HomeScreenCarousel />
      </div>
      <div className="w-1/2 relative">
        <form onSubmit={handleSubmit} className="space-y-4 p-5 flex flex-col">
          <div>
            <label className="block">Username</label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              className="border p-2 rounded w-full dark:bg-zinc-800"
            />
          </div>

          <div className="relative">
            <label className="block">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="•••••••"
              className="border p-2 rounded w-full dark:bg-zinc-800 pr-10"
            />
            {formData.password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 py-2.5 px-3 text-sm "
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
          <div>
            <label className="block">Host</label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleChange}
              className="p-2 rounded w-full dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="block">Port</label>
            <input
              type="text"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className="border p-2 rounded w-full dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="block">Database</label>
            <input
              type="text"
              name="database"
              value={formData.database}
              onChange={handleChange}
              className="border p-2 rounded w-full dark:bg-zinc-800"
            />
          </div>

          <div className="relative">
            <label className="block">Connection String</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={getConnectionStringForDisplay()}
                onClick={handleCopyConnectionString}
                readOnly
                disabled
                className="border p-2 rounded w-full bg-gray-50 dark:bg-zinc-600 cursor-pointer font-mono"
              />
            </div>
          </div>
        </form>
        <div className="absolute bottom-0 w-full p-5 bg-neutral-900">
          <div>
            {error && (
              <FadeOut time={2000}>
                <div className="text-red-800 italic pb-3">{error}</div>
              </FadeOut>
            )}
            {testMessage && (
              <FadeOut time={2000}>
                <div className="text-green-700 italic pb-3">{testMessage}</div>
              </FadeOut>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="bg-amber-600 w-1/6 text-white  py-2 rounded disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test'}
            </button>
            <button
              type="submit"
              disabled={isConnecting}
              onClick={handleSubmit}
              className="bg-violet-600 grow text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
