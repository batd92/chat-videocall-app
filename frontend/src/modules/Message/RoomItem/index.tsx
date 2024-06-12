/* eslint-disable @next/next/no-img-element */
'use client'
import { AvatarWrap, TooltipWrap } from '@/components/commons'
import { IParticipant } from '@/interface/response'
import { ESocketEvent, IMAGE_TYPE, MESSAGE_TYPE } from '@/utils/constants'
import { getImage } from '@/utils/helpers'
import { Button, Dropdown, MenuProps } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import './style.scss'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { useSocket } from '@/providers/Socket'
import { IMessage } from '@/interface/common'
import { Message } from './Message'

interface IConversationItemProps {
    data: any
    isShowName?: boolean
    isMe?: boolean
    isLastMsg?: boolean
    index: number
    participants: (IParticipant & { customIndexRead: number })[]
    setReplyingTo: (value: IMessage | null) => void
}
export const ConversationItem: React.FC<IConversationItemProps> = ({
    data,
    isShowName,
    isMe,
    isLastMsg,
    index,
    participants,
    setReplyingTo,
}) => {
    const [isShowMore, setIsShowMore] = useState<boolean>(false)
    const { sendMessage } = useSocket()

    const handleRemoveMessage = (messageId: string) => {
        sendMessage(
            JSON.stringify({
                event: ESocketEvent.REMOVE_MESSAGE,
                payload: {
                    message: {
                        conversationId: data?.conversationId,
                        _id: messageId,
                    },
                },
            }),
        )
        setIsShowMore(false)
    }

    const handleReplyMessage = (message: IMessage) => {
        setReplyingTo(message)
    }

    const messsageActions: MenuProps['items'] = [
        {
            label: (
                <div onClick={() => handleRemoveMessage(data?._id)}>
                    <p className='action_name'>
                        <DeleteOutlined /> Unsend
                    </p>
                </div>
            ),
            key: '0',
        },
    ]

    if (data?.type === MESSAGE_TYPE.NOTIFY) {
        return (
            <div className={clsx('conversation-item-notif')}>
                <div>
                    <EditOutlined />
                    <span>{data?.content}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={clsx('conversation-item')}>
            <div
                className={clsx('conversation-wrap', isMe && 'conversation-wrap__me')}
            >
                {!isMe && (
                    <TooltipWrap title={data?.user?.name} placement='left' arrow={false}>
                        <div className='left'>
                            <AvatarWrap
                                size={28}
                                src={getImage(data?.user?.avatar!, IMAGE_TYPE.AVATAR)}
                            />
                        </div>
                    </TooltipWrap>
                )}
                <div className='right'>
                    {!isMe && isShowName && (
                        <div className='name'>{data?.user?.name}</div>
                    )}
                    <>
                        {!isShowMore && data?.deletedAt === 0 && (
                            <div className={clsx(['options', { 'options-right': !isMe, 'options-left': isMe }])}>
                                {isMe && <Dropdown
                                    menu={{ items: messsageActions }}
                                    trigger={['click']}
                                    placement='topRight'
                                    arrow={{ pointAtCenter: true }}
                                >
                                    <MoreOutlined />
                                </Dropdown>}
                                <Button className='reply-button' onClick={() => handleReplyMessage(data)}>
                                    <div className='reply-button-icon'>
                                        <img src='/icons/reply.svg' alt='' />
                                    </div>
                                </Button>
                            </div>
                        )}
                    </>
                    {data?.deletedAt !== 0 ? (
                        <div className='message_removed'>
                            <p>You unsent a message</p>
                        </div>
                    ) : (
                        <div>
                            {/* {renderContent(data?.type)} */}
                            <Message data={data} isLastMsg={isLastMsg!} isMe={isMe!} />
                        </div>
                    )}
                </div>
            </div>
            <div className='users-seen'>
                {participants.map(
                    (other, index) =>
                        index == other.customIndexRead && (
                            <AvatarWrap key={index} src={other.avatar} size={14} />
                        ),
                )}
            </div>
        </div>
    )
}
