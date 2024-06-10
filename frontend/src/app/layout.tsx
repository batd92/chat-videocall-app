import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/global.scss'
import AllProviders from '@/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Messenger',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
  return (
    <html lang='ja'>
        <body className={`${inter.className}`}>
            <AllProviders>{children}</AllProviders>
        </body>
    </html>
  )
}
