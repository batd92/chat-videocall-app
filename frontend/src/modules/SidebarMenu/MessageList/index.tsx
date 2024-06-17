import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AvatarWrap } from '@/components/commons/AvatarWrap';
import { formatDateTime } from '@/utils/helpers';
import { IGetMessagesResponse, ITextContent } from '@/interface/response/message/index';
import './style.scss'

interface MessageListProps {
    messages: IGetMessagesResponse[];
    onMessageClick: (message: IGetMessagesResponse) => void;
    hasMore: boolean;
    loadMore: () => void;
    isLoading: boolean;
    keyword: string;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    onMessageClick,
    hasMore,
    loadMore,
    isLoading,
    keyword,
}) => {
    const highlightKeyword = (text: string, keyword: string) => {
        const index = text.toLowerCase().indexOf(keyword.toLowerCase());
        if (index !== -1) {
            const before = text.substring(0, index);
            const match = text.substr(index, keyword.length);
            const after = text.substring(index + keyword.length);
            return (
                <React.Fragment>
                    {before}
                    <span className='highlight'>{match}</span>
                    {after}
                </React.Fragment>
            );
        } else {
            return text;
        }
    };

    const renderTextContent = (content: ITextContent) => {
        const text = content.toString();
        return highlightKeyword(text, keyword);
    };

    const renderContent = (message: IGetMessagesResponse) => {
        const content = message.content;
        switch (message.type) {
            case 'Text':
                const textContent = content as ITextContent;
                return renderTextContent(textContent);
            default:
                return null;
        }
    };

    console.log('messages', messages);
    return (
        <div className='message-container'>
            {messages.length === 0 ? (
                <div className='no-messages'>
                    <p>No messages matching your search criteria.</p>
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={messages.length}
                    hasMore={hasMore}
                    next={loadMore}
                    loader={isLoading && <h4>Loading...</h4>}
                    className='infinite-scroll'
                >
                    {messages.map((message, index) => (
                        <div key={`mgs_${index}`} className='message-item' onClick={() => onMessageClick(message)}>
                            <div className='list-member'>
                                <AvatarWrap size={42} src={message.userId.avatar}/>
                            </div>
                            <div className='message-details'>
                                <div className='message-username'>{message.userId.username}</div>
                                <div className='message-timestamp'>{formatDateTime(message.createdAt)}</div>
                                <div className='message-content'>{renderContent(message)}</div>
                            </div>
                        </div>
                    ))}
                </InfiniteScroll>
            )}
        </div>
    );
};

export default React.memo(MessageList);