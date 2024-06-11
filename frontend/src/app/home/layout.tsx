'use client'
import { RoomList } from '@/modules/Message'
import { SocketProvider } from '@/providers/Socket'
import './style.scss'

const MessageLayout = ({ children }: any) => {
  return (
    <SocketProvider>
        <div className='message-layout'>
            <RoomList />
            {children}
        </div>
    </SocketProvider>
  )
}

export default MessageLayout
