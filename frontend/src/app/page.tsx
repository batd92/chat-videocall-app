'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const HomePage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/t')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  

  return <div></div>
}

export default HomePage
