import React, { createContext, useContext, useEffect, useState } from 'react'
import { getMessaging, getToken } from 'firebase/messaging'
import firebaseApp from '@/utils/firebase/firebase'

interface FcmTokenContextData {
  deviceId: string
  fcmToken: string
  notificationPermissionStatus: string
}

const FcmTokenContext = createContext<FcmTokenContextData>({
    deviceId: '',
    fcmToken: '',
    notificationPermissionStatus: '',
})

interface FcmProviderProps {
    children: React.ReactNode
}

const FcmTokenProvider = ({ children }: FcmProviderProps) => {
    const [deviceId, setDeviceId] = useState('')
    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState('')
    const [token, setToken] = useState('')

  useEffect(() => {
    const detectDeviceId = async () => {
        let uniqueDeviceId = localStorage.getItem('deviceId') || ''

        if (!uniqueDeviceId) {
            uniqueDeviceId =
            Math.random().toString(20).substring(2, 14) +
            Math.random().toString(20).substring(2, 14)
            localStorage.setItem('deviceId', uniqueDeviceId)
        }
        setDeviceId(uniqueDeviceId)
    }

    const retrieveToken = async () => {
      try {
        const tokenCache = localStorage.getItem('fcmToken')
        if (tokenCache) {
            setToken(tokenCache)
        } else {
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const messaging = getMessaging(firebaseApp)
            const permission = await Notification.requestPermission()
            setNotificationPermissionStatus(permission)
            if (permission === 'granted') {
                const currentToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_WEB_PUSH_CERTIFICATE,
                })

                localStorage.setItem('fcmToken', currentToken)
                if (currentToken) {
                    setToken(currentToken)
                }
            }
          }
        }
      } catch (error) {
            console.error('An error occurred while retrieving token:', error)
      }
    }

    detectDeviceId()
    retrieveToken()
  }, [token])

  return (
    <FcmTokenContext.Provider
        value={{ fcmToken: token, notificationPermissionStatus, deviceId }}
    >
        {children}
    </FcmTokenContext.Provider>
  )
}

const useFcmToken = () => {
    const context = useContext(FcmTokenContext)
    if (!context) {
        throw new Error('useFcmToken must be used within an FcmTokenProvider')
    }
    return context
}

export { FcmTokenProvider, useFcmToken }
