import { useEffect, useMemo, useCallback } from 'react';
import useChat from '@/services/socket/useChat';
import { AvatarGroupWrap, AvatarWrap } from '@/components/commons';
import { SeenIcon, SentIcon } from '@/components/icons';
import { useAuth } from '@/providers/auth';
import { IMAGE_TYPE } from '@/utils/constants';
import { getImage, getUserById, trunMessage } from '@/utils/helpers';
import { EllipsisOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import clsx from 'clsx';
import './style.scss';
import { IRoomDetail } from '@/interface/common/index';
import { formatDateTime } from '@/utils/helpers/index';
import { APP_ROUTER } from '@/utils/constants/router';
import { useRouter } from 'next/navigation';

interface IProps {
    room: IRoomDetail;
}

export const RoomItem: React.FC<IProps> = ({ room }) => {
    const {
        id,
        isGroup,
        participants,
        lastMessage: lastMsg,
        totalMessage,
        avatarUrl,
        hasOnline,
        name,
        createdAt,
    } = room;

    const { currentUser } = useAuth();
    const { joinRoom, changeRoom } = useChat();
    const router = useRouter();

    useEffect(() => {
        if (room.id) {
            joinRoom(room.id as string);
            changeRoom(room.id as string);
        }
    }, [room.id, joinRoom, changeRoom]);

    const me = useMemo(() => participants?.find((user: any) => user._id === currentUser?._id), [
        participants,
        currentUser?._id,
    ]);

    const countUnreadMessage = useMemo(() => totalMessage - Number(me?.indexMessageRead || 0), [
        totalMessage,
        me?.indexMessageRead,
    ]);

    const friends = useMemo(() => participants?.filter((person: any) => person._id !== currentUser?._id), [
        participants,
        currentUser?._id,
    ]);

    const readMessageUnread = () => {
        router.push(APP_ROUTER.MESSAGE.CHAT_DETAIL.replace(':id', room?.id));
    };

    const renderMsgStatus = useCallback(() => {
        if (lastMsg?.userId !== currentUser?._id) {
            return countUnreadMessage > 0 ? (
                <Badge
                    count={countUnreadMessage}
                    style={{
                        backgroundColor: 'var(--color-green-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 18,
                        minWidth: 18,
                    }}
                />
            ) : (
                <SeenIcon />
            );
        }
        return <SentIcon />;
    }, [lastMsg, currentUser?._id, countUnreadMessage]);

    const getMessages = useCallback(() => {
        const { type, deletedAt, content, userId } = lastMsg || {};
        const lastUser = getUserById(userId, participants);

        if (deletedAt !== 0) {
            return lastUser?._id === me?._id
                ? 'You unsent a message'
                : `${lastUser?.name} unsent a message`;
        }

        switch (type) {
            case 'File':
                return `Sent ${content?.length} file`;
            case 'Call':
                return content?.status === 'Running'
                    ? isGroup
                        ? 'Initiating a call'
                        : 'Calling you'
                    : isGroup
                    ? '1 call ended'
                    : 'Called you';
            case 'Text':
                return content;
            default:
                return '';
        }
    }, [lastMsg, participants, me?._id, isGroup]);

    const renderMsg = useMemo(() => {
        if (lastMsg) {
            if (isGroup) {
                const lastUser = getUserById(lastMsg?.userId, participants);
                const finalMsg = `${
                    lastUser?._id === currentUser?._id && lastMsg?.deletedAt !== 0 ? 'You' : lastUser?.name
                }: ${getMessages()}`;
                return trunMessage(finalMsg, 30);
            }
            return trunMessage(getMessages(), 30);
        }
        return trunMessage('You are now connected to each other', 30);
    }, [lastMsg, isGroup, participants, currentUser?._id, getMessages]);

    return (
        <div className="c-message-item" onClick={readMessageUnread}>
            <div className="avatar">
                {isGroup && !avatarUrl ? (
                    <AvatarGroupWrap users={participants} isOnline={hasOnline} />
                ) : (
                    <AvatarWrap
                        size={48}
                        src={avatarUrl || getImage(friends?.[0]?.avatarUrl, IMAGE_TYPE.AVATAR)}
                        isOnline={hasOnline}
                    />
                )}
            </div>
            <div className="right">
                <div className="top">
                    <div className="contact-name">
                        {isGroup ? trunMessage(name, 26) : friends && friends.length > 0 ? trunMessage(friends[0]?.username, 26) : ''}
                    </div>
                    <div className="time">{formatDateTime(lastMsg?.createdAt || createdAt)}</div>
                </div>
                <div className="bottom">
                    <div className={clsx('summary', countUnreadMessage > 0 && 'summary__unread')}>
                        {renderMsg}
                    </div>
                    <div className="message-status">{lastMsg && renderMsgStatus()}</div>
                </div>
            </div>
            <div className="tools">
                <div className="more-action">
                    <EllipsisOutlined />
                </div>
            </div>
        </div>
    );
};
