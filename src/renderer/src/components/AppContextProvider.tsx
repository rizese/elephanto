import React, { createContext, useContext } from 'react'

type ContextType<T> = {
  value: T
  setValue: React.Dispatch<React.SetStateAction<T>>
}

const Context = createContext<ContextType<any> | undefined>(undefined)

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = React.useState<any>(null)

  return <Context.Provider value={{ value, setValue }}>{children}</Context.Provider>
}

export const useAppContext = <T,>(): ContextType<T> => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider')
  }
  return context as ContextType<T>
}
