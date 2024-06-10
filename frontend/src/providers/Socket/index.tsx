'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie } from '@/utils/helpers/storage'
import useWebSocket, { SendMessage } from 'react-use-websocket'
import { WebSocketMessage } from 'react-use-websocket/dist/lib/types'
import { TypeDataConversation } from '@/types/socket'
import IncomingCall from '@/components/callings/incomingCall'
import JitsiMeetingCall from '@/components/callings/jitsiMeetingCall'
import { ESocketEvent, TIMEOUT_CALL } from '@/utils/constants'

interface SocketContextData {
  sendMessage: SendMessage
  lastMessage: WebSocketEventMap['message'] | null
}

interface SocketProviderProps {
  children: React.ReactNode
}

const SocketContext = createContext<SocketContextData>({
  lastMessage: null,
  sendMessage: (message: WebSocketMessage, keep?: boolean) => {},
})

const SocketProvider = ({ children }: SocketProviderProps) => {
  const token = getCookie('access_token') ? getCookie('access_token') : ''
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `${process.env.NEXT_PUBLIC_URL_SOCKET}?token=${token}`,
  )
  const [isOpenIncoming, setIsOpenIncoming] = useState<boolean>(false)
  const [isAcceptCall, setIsAcceptCall] = useState(false)
  const [dataConversation, setDataConversation] =
    useState<TypeDataConversation>()
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data)
      const { event, payload } = data
      switch (event) {
        case ESocketEvent.INFO_USER:
          console.log(`UserId: ${payload.user.id} connected`)
          break
        case ESocketEvent.INCOMING_CALL:
          const timerIdCancel = setTimeout(() => {
            handleCancelIncoming(payload?.conversation?.id)
          }, TIMEOUT_CALL)

          setTimerId(timerIdCancel)

          setIsOpenIncoming(true)
          setDataConversation(payload)
          break
        case ESocketEvent.CALL_ENDED:
          setIsAcceptCall(false)
          setIsOpenIncoming(false)
          setDataConversation(undefined)
          break
        case ESocketEvent.PING:
          handleKeepConnect()
          break
        case ESocketEvent.ERROR:
          alert(payload.message)
          break
        default:
          // console.log(event, payload)
          break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])

  const handleCancelIncoming = (id: number | string) => {
    if (dataConversation) {
      setIsOpenIncoming(false)
      setDataConversation(undefined)
      sendMessage(
        JSON.stringify({
          event: ESocketEvent.CANCEL_CALL,
          payload: {
            conversationId: id,
          },
        }),
      )
    }
    clearTimeout(timerId as unknown as number)
  }

  const handleAcceptIncoming = (id: number | string) => {
    setIsOpenIncoming(false)
    setIsAcceptCall(true)
    sendMessage(
      JSON.stringify({
        event: ESocketEvent.JOIN_CALL,
        payload: {
          conversationId: id,
        },
      }),
    )
  }

  const handleKeepConnect = () => {
    sendMessage(JSON.stringify({ event: ESocketEvent.PONG }))
  }

  const handleEndCall = (id: number | string) => {
    setIsAcceptCall(false)
    setDataConversation(undefined)
    sendMessage(
      JSON.stringify({
        event: ESocketEvent.LEAVE_CALL,
        payload: {
          conversationId: id,
        },
      }),
    )
  }
  return (
    <>
      {dataConversation && (
        <IncomingCall
          isOpen={isOpenIncoming}
          conversation={dataConversation.conversation}
          onCancel={() =>
            handleCancelIncoming(dataConversation.conversation._id)
          }
          onOkay={() => handleAcceptIncoming(dataConversation.conversation._id)}
        ></IncomingCall>
      )}
      {isAcceptCall && dataConversation && (
        <JitsiMeetingCall
          roomNameJitsi={dataConversation.roomName}
          tokenJitsi={dataConversation.token}
          onCancel={() => {
            handleEndCall(dataConversation.conversation._id)
          }}
          isOpen={isAcceptCall}
        />
      )}
      <SocketContext.Provider
        value={{
          lastMessage,
          sendMessage,
        }}
      >
        {children}
      </SocketContext.Provider>
    </>
  )
}

const useSocket = () => {
  // Custom hook to use auth context
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within an SocketProvider')
  }
  return context
}

export { SocketProvider, useSocket }
