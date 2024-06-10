/* eslint-disable @next/next/no-img-element */
import { AvatarGroupWrap, AvatarWrap } from '@/components/commons'
import { SeenIcon, SentIcon } from '@/components/icons'
import { useAuth } from '@/providers/Auth'
import { useSocket } from '@/providers/Socket'
import { IParticipant } from '@/types/common'
import { ESocketEvent, IMAGE_TYPE } from '@/utils/constants'
import { APP_ROUTER } from '@/utils/constants/router'
import {
  displayMessageTime,
  getImage,
  getUserById,
  truncateString,
} from '@/utils/helpers'
import { EllipsisOutlined } from '@ant-design/icons'
import { Badge } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import './style.scss'

export const MessageItem = ({ data, rooms, setRooms }: any) => {
  const router = useRouter()
  const { lastMessage, sendMessage } = useSocket()
  const { currentUser } = useAuth()

  const isGroup = data?.isGroup
  const me = data?.participants?.find((user: IParticipant) => user._id === currentUser?._id)
  const unreadMsgMe = data?.totalMessage - me?.indexMessageRead
  const currentFriend = data?.participants?.filter((person: IParticipant) => person._id !== currentUser?._id)

  const renderMsgStatus = () => {
    if (data?.lastMessage?.userId !== currentUser?._id) {
      if (unreadMsgMe > 0) {
        return (
          <Badge
            count={unreadMsgMe}
            style={{
                backgroundColor: 'var(--color-green-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 18,
                minWidth: 18,
            }}
          />
        )
      }
      return <SeenIcon />
    }
    return <SentIcon />
  }

  const handleSeenMessage = () => {
    if (unreadMsgMe > 0) {
      sendMessage(
        JSON.stringify({
            event: ESocketEvent.READ_LAST_MESSAGE,
            payload: { conversationId: data._id },
        }),
      )
    }
    router.push(APP_ROUTER.MESSAGE.CHAT_DETAIL.replace(':id', data?._id))
  }

  const getMessages = () => {
    const type = data?.lastMessage?.type
    const lastUser = getUserById(data?.lastMessage?.userId, data?.participants)
    switch (type) {
      case 'File':
        return data?.lastMessage?.deletedAt !== 0
            ? `${
              lastUser?._id === me?._id ? 'You' : lastUser?.name
            } unsent a message`
            : `Sent ${data?.lastMessage?.content?.length} file`
      case 'Call':
            if (data?.lastMessage?.content?.status === 'Running') {
                return isGroup ? 'Initiating a call' : 'Calling you'
            } else if (data?.lastMessage?.content?.status === 'Ended') {
                return isGroup ? '1 call ended' : 'Called you'
            }
      case 'Text':
        return data?.lastMessage?.deletedAt !== 0
            ? `${
              lastUser?._id === me?._id ? 'You' : lastUser?.name
            } unsent a message`
          : data?.lastMessage?.content
      default:
        return ''
    }
  }

  const renderMsg = () => {
    if (data?.lastMessage) {
      if (isGroup) {
        const lastUser = getUserById(
            data?.lastMessage?.userId,
            data?.participants,
        )
        const finalMsg = `${
            lastUser?._id === currentUser?._id &&
            data?.lastMessage?.deletedAt !== 0
                ? 'You'
                : lastUser?.name
        }: ${getMessages()}`
        return truncateString(finalMsg, 30)
        }
        return truncateString(getMessages(), 30)
    }
    return truncateString('You are now connected to each other', 30)
  }

  useEffect(() => {
    if (lastMessage) {
      const dataSocket = JSON.parse(lastMessage.data)
      const { event, payload } = dataSocket
      switch (event) {
        case ESocketEvent.READ_LAST_MESSAGE:
            const currentRoom = rooms?.find((room: any) => room._id === payload?.conversationId)
            const newCurrentParticipants = currentRoom?.participants?.filter((user: IParticipant) => user._id !== currentUser?._id)
            const me = currentRoom?.participants?.find((user: IParticipant) => user?._id === currentUser?._id)
            const newMe = {
                ...me,
                indexMessageRead: payload.indexReadLastMessage,
                userId: payload.userId,
            }
            const newRoomList = rooms?.map((room: any) => {
                if (currentRoom._id === room._id) {
                return {
                    ...room,
                    participants: [...newCurrentParticipants, newMe],
                }
                }
                return { ...room }
            })
            setRooms(newRoomList)
          break
        default:
          break
      }
    }
  }, [lastMessage, currentUser?._id, rooms, setRooms]);

  return (
    <div className='c-message-item' onClick={handleSeenMessage}>
      <div className='avatar'>
        {isGroup && !data?.avatar ? (
            <AvatarGroupWrap
                users={data?.participants}
                isOnline={data?.hasOnline}
            />
        ) : (
          <AvatarWrap
            size={48}
            src={
              data?.avatar ||
              getImage(currentFriend?.avatar!, IMAGE_TYPE.AVATAR)
            }
            isOnline={data?.hasOnline}
          />
        )}
      </div>
      <div className='right'>
        <div className='top'>
          <div className='contact-name'>
            {   
                isGroup
                ? truncateString(data?.name, 26)
                : currentFriend && currentFriend.length > 0
                ? truncateString(currentFriend[0]?.name, 26)
                : ''
            }
          </div>
          <div className='time'>
            {displayMessageTime(
                data?.lastMessage?.createdAt || data?.createdAt,
            )}
          </div>
        </div>
        <div className='bottom'>
            <div className={clsx('summary', unreadMsgMe > 0 && 'summary__unread')}>
                {renderMsg()}
            </div>
            <div className='message-status'>
                {data?.lastMessage && renderMsgStatus()}
            </div>
        </div>
      </div>
      <div className='tools'>
        <div className='more-action'>
            <EllipsisOutlined />
        </div>
      </div>
    </div>
  )
}
