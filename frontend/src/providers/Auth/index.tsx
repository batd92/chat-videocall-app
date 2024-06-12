'use client'

import { IGetMeResponse, ILoginResponse } from '@/interface/response'
import { deleteCookie, getCookie, setCookie } from '@/utils/helpers/storage'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextData {
    isAuthenticated: boolean
    currentUser: IGetMeResponse | null
    setCurrentUser: (currentUser: IGetMeResponse) => void
    logInSuccess: (data: ILoginResponse) => Promise<void>
    logOutSuccess: () => void
}

interface AuthProviderProps {
    children: React.ReactNode
}

const AuthContext = createContext<AuthContextData>({
    isAuthenticated: false,
    currentUser: null,
    setCurrentUser: (currentUser: IGetMeResponse) => { },
    logInSuccess: (data: ILoginResponse) => Promise.resolve(),
    logOutSuccess: () => { },
})

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<IGetMeResponse | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Watch currentUser
    useEffect(() => {
        if (!currentUser) {
            const user = getCookie('currentUser')
            if (user) {
                setCurrentUser(JSON.parse(user) as IGetMeResponse)
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
            }
        } else {
            setCookie('currentUser', JSON.stringify(currentUser))
        }
    }, [currentUser])

    const logInSuccess = async (data: ILoginResponse) => {
        const { access_token, refresh_token } = data

        // save access token in cookies
        setCookie('access_token', access_token)

        setCookie('refresh_token', refresh_token)

        setIsAuthenticated(true)
    }

    const logOutSuccess = () => {
        // Remove access token from cookies
        deleteCookie('access_token')
        deleteCookie('refresh_token')
        deleteCookie('currentUser')

        // Clear provider state
        setCurrentUser(null)
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                currentUser,
                setCurrentUser,
                logInSuccess,
                logOutSuccess,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => {
    // Custom hook to use auth context
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export { AuthProvider, useAuth }
