'use client'

import { createContext, useContext, useState } from 'react'

interface StateGlobalContextData {
    test?: any
    setTest?: any
    setValueTest?: any
}

interface StateGlobalProviderProps {
    children: React.ReactNode
}

const StateGlobalContext = createContext<StateGlobalContextData>({})

const StateGlobalProvider = ({ children }: StateGlobalProviderProps) => {
    const [test, setTest] = useState()
    const setValueTest = (data: any) => {
        setTest(data)
    }

    return (
        <StateGlobalContext.Provider
            value={{
                test,
                setTest,
                setValueTest,
            }}
        >
            {children}
        </StateGlobalContext.Provider>
    )
}

const useStateGlobal = () => {
    // Custom hook to use StateGlobal context
    const context = useContext(StateGlobalContext)
    if (!context) {
        throw new Error('useStateGlobal must be used within an StateGlobalProvider')
    }
    return context
}

export { StateGlobalProvider, useStateGlobal }
