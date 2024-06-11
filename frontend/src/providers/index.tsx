'use client'
import { ConfigProvider } from 'antd'
import locale from 'antd/es/locale/en_US'
import { ReactNode } from 'react'
import ReactQueryProvider from './ReactQuery'
import { StateGlobalProvider } from './StateGlobal'
import { AuthProvider } from './Auth'
import { FcmTokenProvider } from './FcmToken'

const AllProviders = ({ children }: { children: ReactNode }) => {
    return (
        <ConfigProvider locale={locale}>
            <FcmTokenProvider>
                <AuthProvider>
                    <ReactQueryProvider>
                        <StateGlobalProvider>{children}</StateGlobalProvider>
                    </ReactQueryProvider>
                </AuthProvider>
            </FcmTokenProvider>
        </ConfigProvider>
    )
}

export default AllProviders
