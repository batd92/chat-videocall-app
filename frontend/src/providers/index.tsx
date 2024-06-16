'use client'
import { ConfigProvider } from 'antd'
import locale from 'antd/es/locale/en_US'
import { ReactNode } from 'react'
import ReactQueryProvider from './react-query'
import { AuthProvider } from './auth'
import { FcmTokenProvider } from './fcm-token'

const AllProviders = ({ children }: { children: ReactNode }) => {
    return (
        <ConfigProvider locale={locale}>
            <FcmTokenProvider>
                <AuthProvider>
                    <ReactQueryProvider>
                        {children}
                    </ReactQueryProvider>
                </AuthProvider>
            </FcmTokenProvider>
        </ConfigProvider>
    )
}

export default AllProviders
