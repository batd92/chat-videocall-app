/* eslint-disable @next/next/no-img-element */
import { AvatarGroupWrap, AvatarWrap } from '@/components/commons';
import { SeenIcon, SentIcon } from '@/components/icons';
import { useAuth } from '@/providers/Auth';
import { useSocket } from '@/providers/Socket';
import { IParticipant } from '@/types/common';
import { ESocketEvent, IMAGE_TYPE } from '@/utils/constants';
import { APP_ROUTER } from '@/utils/constants/router';
import {
  displayMessageTime,
  getImage,
  getUserById,
  truncateString,
} from '@/utils/helpers';
import { EllipsisOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';
import './style.scss';

export const MessageItem = ({ data, rooms, setRooms }) => {
    const router = useRouter();
    const { lastMessage, sendMessage } = useSocket();
    const { currentUser } = useAuth();

    const {
        _id: conversationId,
        isGroup,
        participants,
        lastMessage: lastMsg,
        totalMessage,
        avatarUrl,
        hasOnline,
        name,
        createdAt,
    } = data;

    const me = useMemo(
        () => participants?.find((user: any) => user._id === currentUser?._id),
        [participants, currentUser?._id]
    );
    const unreadMsgMe = useMemo(
        () => totalMessage - me?.indexMessageRead,
        [totalMessage, me?.indexMessageRead]
    );
    const currentFriend = useMemo(
        () => participants?.filter((person: any) => person._id !== currentUser?._id),
        [participants, currentUser?._id]
    );

    const renderMsgStatus = useCallback(() => {
        if (lastMsg?.userId !== currentUser?._id) {
            return unreadMsgMe > 0 ? (
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
            ) : (
                <SeenIcon />
            );
        }
        return <SentIcon />;
    }, [lastMsg, currentUser?._id, unreadMsgMe]);

    const handleSeenMessage = useCallback(() => {
        if (unreadMsgMe > 0) {
        sendMessage(
            JSON.stringify({
            event: ESocketEvent.READ_LAST_MESSAGE,
            payload: { conversationId },
            })
        );
        }
        router.push(APP_ROUTER.MESSAGE.CHAT_DETAIL.replace(':id', conversationId));
    }, [unreadMsgMe, sendMessage, conversationId, router]);

    const getMessages = useCallback(() => {
        const { type, deletedAt, content, userId } = lastMsg || {};
        const lastUser = getUserById(userId, participants);

        if (deletedAt !== 0) {
            return lastUser?._id === me?._id ? 'You unsent a message' : `${lastUser?.name} unsent a message`;
        }

        switch (type) {
            case 'File':
                return `Sent ${content?.length} file`;
            case 'Call':
                return content?.status === 'Running'
                ? isGroup ? 'Initiating a call' : 'Calling you'
                : isGroup ? '1 call ended' : 'Called you';
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
                const finalMsg = `${lastUser?._id === currentUser?._id && lastMsg?.deletedAt !== 0 ? 'You' : lastUser?.name}: ${getMessages()}`;
                return truncateString(finalMsg, 30);
            }
            return truncateString(getMessages(), 30);
        }
        return truncateString('You are now connected to each other', 30);
    }, [lastMsg, isGroup, participants, currentUser?._id, getMessages]);

    useEffect(() => {
        if (lastMessage) {
        const { event, payload } = JSON.parse(lastMessage.data);
        if (event === ESocketEvent.READ_LAST_MESSAGE) {
            const currentRoom = rooms?.find((room: any) => room._id === payload?.conversationId);
            if (currentRoom) {
                const newCurrentParticipants = currentRoom?.participants?.filter((user: any) => user._id !== currentUser?._id);
                const me = currentRoom?.participants?.find((user: any) => user?._id === currentUser?._id);
                const newMe = {
                    ...me,
                    indexMessageRead: payload.indexReadLastMessage,
                    userId: payload.userId,
                };
                const newRoomList = rooms?.map((room: any) =>
                    currentRoom._id === room._id
                    ? { ...room, participants: [...newCurrentParticipants, newMe] }
                    : { ...room }
                );
                setRooms(newRoomList);
            }
        }
        }
    }, [lastMessage, currentUser?._id, rooms, setRooms]);

    return (
        <div className="c-message-item" onClick={handleSeenMessage}>
            <div className="avatar">
                {isGroup && !avatarUrl ? (
                <AvatarGroupWrap users={participants} isOnline={hasOnline} />
                ) : (
                <AvatarWrap
                    size={48}
                    src={avatarUrl || getImage(currentFriend?.[0]?.avatar, IMAGE_TYPE.AVATAR)}
                    isOnline={hasOnline}
                />
                )}
            </div>
            <div className="right">
                <div className="top">
                <div className="contact-name">
                    {isGroup
                    ? truncateString(name, 26)
                    : currentFriend && currentFriend.length > 0
                    ? truncateString(currentFriend[0]?.name, 26)
                    : ''}
                </div>
                <div className="time">
                    {displayMessageTime(lastMsg?.createdAt || createdAt)}
                </div>
                </div>
                <div className="bottom">
                <div className={clsx('summary', unreadMsgMe > 0 && 'summary__unread')}>
                    {renderMsg}
                </div>
                <div className="message-status">
                    {lastMsg && renderMsgStatus()}
                </div>
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
