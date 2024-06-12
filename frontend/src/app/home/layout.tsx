'use client'
import { NavigationRoom } from '../../modules/NavigationRoom'
import { SocketProvider } from '@/providers/Socket'
import './style.scss'

const MessageLayout = ({ children }: any) => {
  return (
    <SocketProvider>
        <div className='message-layout'>
            <NavigationRoom />
            {children}
        </div>
    </SocketProvider>
  )
}

export default MessageLayout
