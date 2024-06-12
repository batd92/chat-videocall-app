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
import { IMessage, ITypingUser } from '@/interface/common'
import { IGetMessagesRequest } from '@/interface/request'
import {
  IGetMessagesResponse,
  IGetRoomResponse,
  IParticipant,
} from '@/interface/response'
import { TypeDataConversation } from '@/interface/socket'
import { ESocketEvent, IMAGE_TYPE, TIMEOUT_CALL } from '@/utils/constants'
import { getImage, getUserById, truncateString } from '@/utils/helpers'
import { Divider, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'
import { ConversationItem, TypingItem } from '..'
import SidebarMenu from '../../SidebarMenu/index'
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
    const [dataConversation, setDataConversation] = useState<TypeDataConversation>()
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)
    const [searchMsgId, setSearchMsgId] = useState<string | null>(null)

    const [params, setParams] = useState<IGetMessagesRequest>({
        limit: 20,
        lastRecord: '',
        isJumpToMessages: false,
    })

    // Fetch Room Detail Query
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
                setRoomDetailLocal(response?.room)
                setTypingUsers(typingUserList)
                !isOpen && refetchRawMessages()
            },
        },
    )

    // Fetch Messages Query
    const { data: rawMessages, refetch: refetchRawMessages } = useQuery(
        [ENDPOINT.MESSAGE.GET_MESSAGES, roomId, params.lastRecord],
        () => MessageService.getMessages({ id: roomId, params }),
            {
                enabled: !!params && !!roomId && params.lastRecord !== '',
                onSuccess: (response: any) => {
                    if (!response?.data || response.data.length === 0) {
                        setParams({
                            ...params,
                            lastRecord: '',
                            isJumpToMessages: false,
                        })
                        return;
                    }
    
                    const messages = response.data.map((message: IGetMessagesResponse) => ({
                        ...message,
                        user:
                            getUserById(message.userId, roomDetailLocal?.participants || []) ||
                            null,
                        }))
    
                    const resultData = params.isJumpToMessages
                        ? messages
                        : uniqBy([...officialMessages, ...messages], '_id')
    
                    setOfficialMessages(resultData)
    
                    const elementId = searchMsgId || (messages && messages[0]?._id)
                    const element = document.getElementById(elementId)
    
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
        if (!lastMessage) return;
    
        const data = JSON.parse(lastMessage.data);
        const { event, payload } = data;
    
        const handleUserJoined = () => {
            setIsStartCall(false);
            setIsOpenMeeting(true);
            setDataConversation(payload);
            clearTimeout(timerId as unknown as number);
        };
    
        const handleCallEnded = () => {
            setIsOpenMeeting(false);
            setDataConversation(undefined);
            setIsStartCall(false);
        };
    
        const handleSendMessage = () => {
            if (payload?.message?.conversationId !== roomId) return;
    
            const result = officialMessages.filter((e: IGetMessagesResponse) => e._id !== payload?.message._id);
            const payloadMessage = {
                ...payload?.message,
                user: getUserById(payload?.message?.userId, payload?.conversation?.participants),
            };
            result.unshift(payloadMessage);
            const updatedTypingUsers = typingUsers.map((user) =>
                user._id === payload?.message.userId ? { ...user, isTyping: false } : user
            );
            setTypingUsers(updatedTypingUsers);
            setOfficialMessages(result);
            setRoomDetailLocal({ ...roomDetailLocal, ...payload?.conversation });
    
            if (payload.message.userId !== currentUser?._id) {
                sendMessage(
                    JSON.stringify({
                        event: ESocketEvent.READ_LAST_MESSAGE,
                        payload: {
                            conversationId: roomId,
                        },
                    })
                );
            }
        };
    
        const handleRemoveMessage = () => {
            const result = officialMessages?.map((message: IMessage) =>
                message?._id !== payload?.message?._id ? message : { ...message, ...payload?.message }
            );
            setOfficialMessages(result);
            setRoomDetailLocal({ ...roomDetailLocal, ...payload?.conversation });
        };
    
        const handleReadLastMessage = () => {
            const { conversationId, userId, indexReadLastMessage } = payload;
            if (roomDetailLocal && conversationId === roomDetailLocal._id) {
                setRoomDetailLocal({
                    ...roomDetailLocal,
                    participants: roomDetailLocal.participants.map((user: any) =>
                        user._id === userId ? { ...user, indexMessageRead: indexReadLastMessage } : user
                    ),
                });
            }
        };
    
        const handleTypingMessage = () => {
            if (payload.conversationId === roomId) {
                const updatedTypingUsers = typingUsers.map((user) =>
                    user._id === payload?.userId ? { ...user, isTyping: payload?.isTyping } : user
                );
                setTypingUsers(updatedTypingUsers);
            }
        };
    
        switch (event) {
            case ESocketEvent.USER_JOINED:
                handleUserJoined();
                break;
            case ESocketEvent.CALL_ENDED:
                handleCallEnded();
                break;
            case ESocketEvent.SEND_MESSAGE:
                handleSendMessage();
                break;
            case ESocketEvent.REMOVE_MESSAGE:
                handleRemoveMessage();
                break;
            case ESocketEvent.READ_LAST_MESSAGE:
                handleReadLastMessage();
                break;
            case ESocketEvent.TYPING_MESSAGE:
                handleTypingMessage();
                break;
            default:
                break;
        }
    }, [lastMessage]);
    

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
        const todayDateString = new Date().toISOString().split('T')[0]; // Lấy ngày tháng từ định dạng ISO
        const participants = roomDetailLocal?.participants
            ?.filter((other: any) => other._id !== currentUser?._id)
            .map((e: any) => ({ ...e, customIndexRead: roomDetailLocal.totalMessage - e.indexMessageRead })) || [];
    
        let indexMessage = -1;
        let todayMessages: IGetMessagesResponse[] = [];
    
        const groupedMessages = officialMessages.reduce((groups, message) => {
            const messageDate = new Date(message.createdAt).toISOString().split('T')[0];
            if (messageDate === todayDateString) {
                if (!groups.todayMessages) groups.todayMessages = [];
                groups.todayMessages.push(message);
            } else {
                if (!groups[messageDate]) groups[messageDate] = [];
                groups[messageDate].push(message);
            }
            return groups;
        }, {});
    
        const result = Object.keys(groupedMessages).map(date => ({
            date,
            messages: groupedMessages[date]
        }));
    
        if (groupedMessages.todayMessages) {
            result.unshift({ date: todayDateString, messages: groupedMessages.todayMessages });
        }
    
        // Hiển thị tin nhắn theo nhóm ngày
        return result.map((messageGroup: any, indexGroup: number) => (
            <div key={indexGroup}>
                <div className='time-group'>
                    <Divider>{messageGroup.date}</Divider>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '10px' }}>
                    {messageGroup.messages.map((message: any, index: number) => {
                        indexMessage++;
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
                        );
                    })}
                </div>
            </div>
        ));
    };
    

    const renderContent = () => {
        if (!roomId) {
            return (
                <div className='no-chat-selected'>
                    <ChatIcon width={100} height={100} />
                    <span className='note'>No chat selected yet</span>
                </div>
            );
        }
    
        const waitingCallComponent = roomDetailLocal && (
            <WaitingCall
                conversation={roomDetailLocal}
                isOpen={isStartCall}
                onCancel={() => handleCancelCall(roomDetailLocal._id)}
            />
        );
    
        const jitsiMeetingComponent = dataConversation && (
            <JitsiMeetingCall
                roomNameJitsi={dataConversation.roomName}
                tokenJitsi={dataConversation.token}
                onCancel={() => handleEndCall(dataConversation.conversation._id)}
                isOpen={isOpenMeeting}
            />
        );
    
        const userAvatar = roomDetailLocal?.isGroup && !roomDetailLocal?.avatarUrl ? (
            <AvatarGroupWrap
                users={roomDetailLocal?.participants}
                isOnline={roomDetailLocal?.hasOnline}
            />
        ) : (
            <AvatarWrap
                size={48}
                isOnline={roomDetailLocal?.hasOnline}
                src={
                    roomDetailLocal?.avatarUrl ||
                    getImage(currentFriend?.avatar!, IMAGE_TYPE.AVATAR)
                }
            />
        );
    
        const userName = roomDetailLocal?.isGroup ?
            truncateString(roomDetailLocal?.name, 40) :
            truncateString(currentFriend?.name || '', 40);
    
        return (
            <>
                {waitingCallComponent}
                {jitsiMeetingComponent}
                <div className='header header-msg'>
                    <div className='user-info'>
                        {userAvatar}
                        <div className='user-info--right'>
                            <span className='name'>{userName}</span>
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
                <div className='content' id='scrollableDiv'>
                    <InfiniteScroll
                        dataLength={Number(officialMessages?.length) || 0}
                        next={onGetMoreMsg}
                        style={
                            {
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                gap: '12px',
                                padding: '0 10px',
                                overflowX: 'hidden',
                                marginTop: '10px',
                            }
                        }
                            inverse={true}
                            hasMore={rawMessages?.data?.lastRecord !== ''}
                            loader={<h4>Loading...</h4>}
                            scrollableTarget='scrollableDiv'
                            ref={messagesEndRef}
                        >
                        <>
                            {
                                typingUsers?.map((other, index) => other?.isTyping && <TypingItem key={index} data={other!} />)
                            }
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
                    <SidebarMenu
                        open={isOpen}
                        cancel={handelCloseDetail}
                        handleRedirectSearch={handleRedirectSearch}
                        setRoomDetailLocal={setRoomDetailLocal}
                        roomDetail={roomDetailLocal!}
                        avatar={userAvatar}
                        name={userName}
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
        );
    };    

    return (
        <div className='c-message-content'>
            <div className='content-wrapper'>{renderContent()}</div>
        </div>
    )
}
