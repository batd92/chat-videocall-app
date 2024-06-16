import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { IMessage } from '@/interface/common/index'
import { AvatarWrap } from '@/components/commons/AvatarWrap'
import { formatDateTime } from '@/utils/helpers'

interface MessageListProps {
    messages: IMessage[]
    participants: any[]
    onMessageClick: (message: IMessage) => void
    hasMore: boolean
    loadMore: () => void
    isLoading: boolean
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    participants,
    onMessageClick,
    hasMore,
    loadMore,
    isLoading
}) => {
    return (
        <div className='content' id='scrollableDiv' style={{ overflow: 'auto', width: '100%' }}>
            <InfiniteScroll
                dataLength={messages.length}
                hasMore={hasMore}
                next={loadMore}
                loader={isLoading && <h4>Loading...</h4>}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 10px', marginTop: '10px', maxHeight: '500px' }}
                scrollableTarget='scrollableDiv'
            >
                {messages.map((messageGroup, indexGroup) => (
                    <div key={`mgs_${indexGroup}`} onClick={() => onMessageClick(messageGroup)}>
                        {participants.map((participant: any) => (
                            <div key={participant._id}>
                                {messageGroup.userId === participant._id && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div className='list-member'>
                                            <AvatarWrap size={42} src={participant.avatarUrl} />
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>{participant.name}</div>
                                                <div>{formatDateTime(messageGroup.createdAt)}</div>
                                            </div>
                                            <div>{messageGroup.content}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    )
}

export default React.memo(MessageList)
