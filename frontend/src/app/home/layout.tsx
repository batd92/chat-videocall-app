'use client'
import { NavigationRoom } from '../../modules/NavigationRoom'
import './style.scss'

const MessageLayout = ({ children }: any) => {
  return (
      <div className='message-layout'>
        <NavigationRoom />
        {children}
      </div>
  )
}

export default MessageLayout
