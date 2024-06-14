/* eslint-disable @next/next/no-img-element */
'use client'
import { AvatarWrap, TooltipWrap } from '@/components/commons'
import { IParticipant } from '@/interface/response'
import { IMAGE_TYPE, MESSAGE_TYPE } from '@/utils/constants'
import { getImage } from '@/utils/helpers'
import { Button, Dropdown, MenuProps } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import './style.scss'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { Message } from './Message'
import { IGetMessagesResponse } from '@/interface/response/message/index'

interface IMessageItemProps {
    message: IGetMessagesResponse
    isShowName?: boolean
    isMe?: boolean
    isLastMsg?: boolean
    index: number
    participants: (IParticipant & { customIndexRead: number })[]
}
export const MessageItem: React.FC<IMessageItemProps> = ({
    message,
    isShowName,
    isMe,
    isLastMsg,
    participants,
}) => {
    const [isShowMore, setIsShowMore] = useState<boolean>(false)

    const handleRemoveMessage = (messageId: string) => {
        setIsShowMore(false)
    }

    const handleReplyMessage = (message: IGetMessagesResponse) => {
    }

    const messsageActions: MenuProps['items'] = [
        {
            label: (
                <div onClick={() => handleRemoveMessage(message?._id)}>
                    <p className='action_name'>
                        <DeleteOutlined /> Unsend
                    </p>
                </div>
            ),
            key: '0',
        },
    ]

    if (message?.type === MESSAGE_TYPE.NOTIFY) {
        return (
            <div className={clsx('conversation-item-notif')}>
                <div>
                    <EditOutlined />
                    <span>{message.content.toString()}</span>
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
                    <TooltipWrap title={message.userId.username} placement='left' arrow={false}>
                        <div className='left'>
                            <AvatarWrap
                                size={28}
                                src={getImage(message.userId.avatar!, IMAGE_TYPE.AVATAR)}
                            />
                        </div>
                    </TooltipWrap>
                )}
                <div className='right'>
                    {!isMe && isShowName && (
                        <div className='name'>{message.userId.username}</div>
                    )}
                    <>
                        {!isShowMore && !message.deletedAt && (
                            <div className={clsx(['options', { 'options-right': !isMe, 'options-left': isMe }])}>
                                {isMe && <Dropdown
                                    menu={{ items: messsageActions }}
                                    trigger={['click']}
                                    placement='topRight'
                                    arrow={{ pointAtCenter: true }}
                                >
                                    <MoreOutlined />
                                </Dropdown>}
                                <Button className='reply-button' onClick={() => handleReplyMessage(message)}>
                                    <div className='reply-button-icon'>
                                        <img src='/icons/reply.svg' alt='' />
                                    </div>
                                </Button>
                            </div>
                        )}
                    </>
                    {!!(message.deletedAt) ? (
                        <div className='message_removed'>
                            <p>You unsent a message</p>
                        </div>
                    ) : (
                        <div>
                            {/* {renderContent(data?.type)} */}
                            <Message message={message} isLastMsg={isLastMsg!} isMe={isMe!} />
                        </div>
                    )}
                </div>
            </div>
            <div className='users-seen'>
                {participants.map(
                    (other, index) =>
                        index == other.customIndexRead && (
                            <AvatarWrap key={index} src={other.avatarUrl} size={14} />
                        ),
                )}
            </div>
        </div>
    )
}
