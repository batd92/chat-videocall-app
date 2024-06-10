'use client'
/* eslint-disable @next/next/no-img-element */
import JitsiMeetingCall from '@/components/callings/jitsiMeetingCall'
import WaitingCall from '@/components/callings/waitingCall'
import { AvatarGroupWrap, AvatarWrap } from '@/components/commons'
import { ChatIcon } from '@/components/icons'
import { DetailIcon } from '@/components/icons/DetailIcon'
import { useAuth } from '@/providers/Auth'
import { useSocket } from '@/providers/Socket'
import { MessageService, RoomService } from '@/services'
import { ENDPOINT } from '@/services/endpoint'
import { IMessage, ITypingUser } from '@/types/common'
import { IGetMessagesRequest } from '@/types/request'
import {
    IGetMessagesResponse,
    IGetRoomResponse,
    IParticipant,
} from '@/types/response'
import { TypeDataConversation } from '@/types/socket'
import { ESocketEvent, IMAGE_TYPE, TIMEOUT_CALL } from '@/utils/constants'
import { getImage, getUserById, truncateString } from '@/utils/helpers'
import { Divider, Tooltip } from 'antd'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'
import { ConversationItem, TypingItem } from '..'
import MessageMenu from '../MessageMenu'
import './style.scss'
import { MessageFooter } from '../Footer'
import { uniqBy } from 'lodash'

interface IProps {
    roomId: string
}

export const MessageContent: React.FC<IProps> = ({ roomId }) => {
    const { currentUser } = useAuth()
    const messagesEndRef = useRef<any>(null)
    const { lastMessage, sendMessage } = useSocket()
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [replyingTo, setReplyingTo] = useState<IMessage | null>(null)
    const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([])
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [officialMessages, setOfficialMessages] = useState<IMessage[]>([])
    const [isStartCall, setIsStartCall] = useState<boolean>(false)
    const [isOpenMeeting, setIsOpenMeeting] = useState<boolean>(false)
    const [roomDetailLocal, setRoomDetailLocal] = useState<IGetRoomResponse>()
    const [dataConversation, setDataConversation] =
        useState<TypeDataConversation>()
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)
    const [searchMsgId, setSearchMsgId] = useState<string | null>(null)

    const [params, setParams] = useState<IGetMessagesRequest>({
        limit: 20,
        lastRecord: '',
        isJumpToMessages: false,
    })

    const { refetch: refetchRoomDetail } = useQuery(
        [ENDPOINT.ROOM.GET_ROOM_DETAIL],
        () => RoomService.getRoomDetail(roomId),
        {
            enabled: !!roomId,
            onSuccess: (response: any) => {
                const typingUserList = (response?.data?.participants ?? [])
                    .map((user: any) => ({
                        ...user,
                        isTyping: false,
                    }))
                    .filter((other: any) => other._id !== currentUser?._id)
                setRoomDetailLocal(response?.data)
                setTypingUsers(typingUserList)
                !isOpen && refetchRawMessages()
            },
        },
    )

    const { data: rawMessages, refetch: refetchRawMessages } = useQuery(
        [ENDPOINT.MESSAGE.GET_MESSAGES, roomId, params.lastRecord],
        () => MessageService.getMessages({ id: roomId, params }),
        {
            enabled: !!params && !!roomId && params.lastRecord !== '',
            onSuccess: (data: any) => {
                const dataApi =
                    data &&
                    data.data.data.map((message: IGetMessagesResponse) => {
                        const user = getUserById(
                            message.userId,
                            roomDetailLocal?.participants || [],
                        )
                        return {
                            ...message,
                            user: user || null,
                        }
                    })
                if (dataApi) {
                    const resultData = params.isJumpToMessages
                        ? dataApi
                        : uniqBy([...officialMessages, ...dataApi], '_id')
                    setOfficialMessages(resultData)
                    setTimeout(() => {
                        const element = document.getElementById(
                            searchMsgId || dataApi[0]?._id,
                        )
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'nearest',
                            })
                        }

                        if (searchMsgId) {
                            setSearchMsgId(null)
                            setParams({
                                ...params,
                                isJumpToMessages: false,
                            })
                        }
                    }, 300)
                    return
                }

                setParams({
                    ...params,
                    lastRecord: '',
                    isJumpToMessages: false,
                })
            },
        },
    )

    const handleRedirectSearch = (e: any) => {
        setSearchMsgId(e?._id || null)
        setIsOpen(false)
        const elementTarget = document.getElementById(e?._id)
        if (elementTarget) {
            elementTarget.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
            return
        }
        setParams({
            ...params,
            lastRecord: JSON.stringify(e._id),
            isJumpToMessages: true,
        })
    }

    useEffect(() => {
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data)
            const { event, payload } = data
            switch (event) {
                case ESocketEvent.USER_JOINED:
                    setIsStartCall(false)
                    setIsOpenMeeting(true)
                    setDataConversation(payload)
                    clearTimeout(timerId as unknown as number)
                    break
                case ESocketEvent.CALL_ENDED:
                    setIsOpenMeeting(false)
                    setDataConversation(undefined)
                    setIsStartCall(false)
                    break
                case ESocketEvent.SEND_MESSAGE:
                    if (payload?.message?.conversationId === roomId) {
                        const result = officialMessages.filter(
                            (e: IGetMessagesResponse) => e._id != payload?.message._id,
                        )
                        const payloadMessage = {
                            ...payload?.message,
                            user: getUserById(
                                payload?.message?.userId,
                                payload?.conversation?.participants,
                            ),
                        }
                        result.unshift(payloadMessage)
                        const updatedTypingUsers = typingUsers.map((user) =>
                            user._id === payload?.message.userId
                                ? { ...user, isTyping: false }
                                : user,
                        )
                        setTypingUsers(updatedTypingUsers)
                        setOfficialMessages(result)
                        setRoomDetailLocal({ ...roomDetailLocal, ...payload?.conversation })
                        if (payload.message.userId != currentUser?._id) {
                            sendMessage(
                                JSON.stringify({
                                    event: ESocketEvent.READ_LAST_MESSAGE,
                                    payload: {
                                        conversationId: roomId,
                                    },
                                }),
                            )
                        }
                    }
                    break
                case ESocketEvent.REMOVE_MESSAGE:
                    const result = officialMessages?.map((message: IMessage) =>
                        message?._id !== payload?.message?._id
                            ? message
                            : { ...message, ...payload?.message },
                    )
                    setOfficialMessages(result)
                    setRoomDetailLocal({ ...roomDetailLocal, ...payload?.conversation })
                    break
                case ESocketEvent.READ_LAST_MESSAGE:
                    const { conversationId, userId, indexReadLastMessage } = payload
                    if (roomDetailLocal) {
                        if (conversationId === roomDetailLocal._id) {
                            setRoomDetailLocal({
                                ...roomDetailLocal,
                                participants: roomDetailLocal.participants.map((user) =>
                                    user._id === userId
                                        ? {
                                            ...user,
                                            indexMessageRead: indexReadLastMessage,
                                        }
                                        : user,
                                ),
                            })
                        }
                    }
                    break

                case ESocketEvent.TYPING_MESSAGE:
                    if (payload.conversationId === roomId) {
                        const updatedTypingUsers = typingUsers.map((user) =>
                            user._id === payload?.userId
                                ? { ...user, isTyping: payload?.isTyping }
                                : user,
                        )
                        setTypingUsers(updatedTypingUsers)
                    }
                    break
                default:
                    break
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastMessage])

    const handleCall = (id: string) => {
        setIsStartCall(true)

        sendMessage(
            JSON.stringify({
                event: ESocketEvent.START_CALL,
                payload: {
                    conversationId: id,
                },
            }),
        )

        const timerIdCancel = setTimeout(() => {
            handleCancelCall(String(id))
        }, TIMEOUT_CALL)

        setTimerId(timerIdCancel)
    }

    const handleCancelCall = (id: string) => {
        setIsStartCall(false)
        sendMessage(
            JSON.stringify({
                event: ESocketEvent.CANCEL_CALL,
                payload: {
                    conversationId: id,
                },
            }),
        )
        clearTimeout(timerId as unknown as number)
    }

    const handleEndCall = (id: number | string) => {
        setIsOpenMeeting(false)
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

    const handelDetail = () => {
        setIsOpen((prevState) => !prevState)
        refetchRoomDetail()
    }

    const handelCloseDetail = () => {
        setIsOpen(false)
    }

    const currentFriend = roomDetailLocal?.participants?.find(
        (person: IParticipant) => person?._id !== currentUser?._id,
    )

    const onGetMoreMsg = () => {
        setParams({
            ...params,
            lastRecord: JSON.stringify(
                officialMessages.length === 1
                    ? officialMessages[officialMessages?.length - 1]._id
                    : officialMessages[officialMessages?.length - 2]._id,
            ),
        })
    }

    const renderMessages = () => {
        let firstIndexToday = -1
        for (var i = officialMessages.length - 1; i >= 0; i--) {
            const message = officialMessages[i]
            if (
                new Date(message.createdAt).toDateString() === new Date().toDateString()
            ) {
                firstIndexToday = i
                break
            }
        }
        const groupDateObject = officialMessages.reduce(
            (
                target: Record<
                    string,
                    { date: string; messages: IGetMessagesResponse[] }
                >,
                message: IGetMessagesResponse,
            ) => {
                var messageDate = new Date(message.createdAt).toDateString()
                if (!target[messageDate]) {
                    target[messageDate] = {
                        date: messageDate,
                        messages: [],
                    }
                }
                target[messageDate].messages.push(message)
                return target
            },
            {},
        )
        const result: { date: string; messages: IGetMessagesResponse[] }[] =
            Object.values(groupDateObject)
        const participants =
            roomDetailLocal?.participants
                ?.filter((other) => other._id !== currentUser?._id)
                .map((e) => ({
                    ...e,
                    customIndexRead: roomDetailLocal.totalMessage - e.indexMessageRead,
                })) || []
        let indexMessage = -1

        return result.map((messageGroup, indexGroup) => {
            return (
                <div key={indexGroup}>
                    <div className='time-group'>
                        <Divider>
                            {new Date().toDateString() == messageGroup.date
                                ? 'Today'
                                : moment(messageGroup.date).format('YYYY-MM-DD')}
                        </Divider>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            gap: '10px',
                        }}
                    >
                        {messageGroup.messages.map((message, index) => {
                            indexMessage++
                            return (
                                <div key={message._id} id={message._id}>
                                    <ConversationItem
                                        key={indexMessage}
                                        index={indexMessage}
                                        data={message}
                                        isMe={currentUser?._id === message?.userId}
                                        isLastMsg={indexMessage === 0}
                                        participants={participants}
                                        isShowName={roomDetailLocal?.isGroup}
                                        setReplyingTo={setReplyingTo}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        })
    }
    const renderContent = () => {
        if (roomId) {
            return (
                <>
                    {roomDetailLocal && (
                        <WaitingCall
                            conversation={roomDetailLocal}
                            isOpen={isStartCall}
                            onCancel={() => handleCancelCall(roomDetailLocal._id)}
                        ></WaitingCall>
                    )}

                    {dataConversation && (
                        <JitsiMeetingCall
                            roomNameJitsi={dataConversation.roomName}
                            tokenJitsi={dataConversation.token}
                            onCancel={() => {
                                handleEndCall(dataConversation.conversation._id)
                            }}
                            isOpen={isOpenMeeting}
                        />
                    )}
                    <div className='header header-msg'>
                        <div className='user-info'>
                            {roomDetailLocal?.isGroup && !roomDetailLocal?.avatar ? (
                                <AvatarGroupWrap
                                    users={roomDetailLocal?.participants}
                                    isOnline={roomDetailLocal?.hasOnline}
                                />
                            ) : (
                                <AvatarWrap
                                    size={48}
                                    isOnline={roomDetailLocal?.hasOnline}
                                    src={
                                        roomDetailLocal?.avatar ||
                                        getImage(currentFriend?.avatar!, IMAGE_TYPE.AVATAR)
                                    }
                                />
                            )}
                            <div className='user-info--right'>
                                {roomDetailLocal?.isGroup ? (
                                    <span className='name'>
                                        {truncateString(roomDetailLocal?.name, 40)}
                                    </span>
                                ) : (
                                    <span className='name'>
                                        {truncateString(currentFriend?.name || '', 40)}
                                    </span>
                                )}
                                {!roomDetailLocal?.isGroup &&
                                    (roomDetailLocal?.hasOnline ? (
                                        <span className='status'>Online</span>
                                    ) : (
                                        <span className='status'>Offline</span>
                                    ))}
                            </div>
                        </div>
                        <div className='actions'>
                            <Tooltip title='Voice Call'>
                                <div className='voice-call' onClick={() => handleCall(roomId)}>
                                    <img src='/icons/voice-call.svg' alt='' />
                                </div>
                            </Tooltip>
                            <Tooltip title='Detail'>
                                <div className='voice-call' onClick={handelDetail}>
                                    <DetailIcon />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div
                        className='content'
                        id='scrollableDiv'
                        style={{
                            overflow: 'auto',
                            display: 'flex',
                            flexDirection: 'column-reverse',
                        }}
                    >
                        <InfiniteScroll
                            dataLength={Number(officialMessages?.length) || 0}
                            next={onGetMoreMsg}
                            style={{
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                gap: '12px',
                                padding: '0 10px',
                                overflowX: 'hidden',
                                marginTop: '10px',
                            }}
                            inverse={true}
                            hasMore={rawMessages?.data?.lastRecord !== ''}
                            loader={<h4>Loading...</h4>}
                            scrollableTarget='scrollableDiv'
                            ref={messagesEndRef}
                        >
                            <>
                                {typingUsers?.map(
                                    (other, index) =>
                                        other?.isTyping && <TypingItem key={index} data={other!} />,
                                )}
                                {renderMessages()}
                            </>
                        </InfiniteScroll>
                    </div>
                    <MessageFooter
                        isTyping={isTyping}
                        setIsTyping={setIsTyping}
                        roomId={roomId}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                    />
                    {isOpen && (
                        <MessageMenu
                            open={isOpen}
                            cancel={handelCloseDetail}
                            handleRedirectSearch={handleRedirectSearch}
                            setRoomDetailLocal={setRoomDetailLocal}
                            conversationDetail={roomDetailLocal!}
                            avatar={
                                roomDetailLocal?.isGroup && !roomDetailLocal?.avatar ? (
                                    <AvatarGroupWrap
                                        users={roomDetailLocal?.participants}
                                        isOnline={roomDetailLocal?.hasOnline}
                                    />
                                ) : (
                                    <AvatarWrap
                                        size={48}
                                        isOnline={roomDetailLocal?.hasOnline}
                                        src={
                                            roomDetailLocal?.avatar ||
                                            getImage(currentFriend?.avatar!, IMAGE_TYPE.AVATAR)
                                        }
                                    />
                                )
                            }
                            name={
                                roomDetailLocal?.isGroup
                                    ? roomDetailLocal?.name
                                    : currentFriend?.name
                            }
                            status={
                                !roomDetailLocal?.isGroup &&
                                (roomDetailLocal?.hasOnline ? (
                                    <span className='status'>Online</span>
                                ) : (
                                    <span className='status'>Offline</span>
                                ))
                            }
                            refresh={() => refetchRoomDetail()}
                        />
                    )}
                </>
            )
        }
        return (
            <div className='no-chat-selected'>
                <ChatIcon width={100} height={100} />
                <span className='note'>No chat selected yet</span>
            </div>
        )
    }

    return (
        <div className='c-message-content'>
            <div className='content-wrapper'>{renderContent()}</div>
        </div>
    )
}
