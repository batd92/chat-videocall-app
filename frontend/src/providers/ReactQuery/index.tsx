'use client'

import { RETRY, WINDOW_FOCUS_REFETCH } from '@/utils/constants/useQueryOption'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: RETRY,
      refetchOnWindowFocus: WINDOW_FOCUS_REFETCH,
    },
  },
})

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
