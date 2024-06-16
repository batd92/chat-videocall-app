import { useEffect, useRef, useState, useCallback } from "react";
import { User, TypingInfo, Message } from "./types";
import { useAuth } from "@/providers/auth/index";
import { IGetMessagesResponse } from "@/interface/response/message/index";
import { ITypingUser } from "@/interface/common";
import SocketService from './socket-manager';

const socketService = SocketService.getInstance();

interface BasePayload<T> {
    roomId: string;
    body: T;
}

const useChat = () => {
    const { currentUser } = useAuth();
    const socketRef = useRef(socketService.getSocket());
    const [roomId, setRoomId] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<IGetMessagesResponse | null>(null);
    const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
    const [joinedRoom, setJoinedRoom] = useState<boolean>(false);

    const joinRoom = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser || joinedRoom) return;
        const payload = { roomId, userId: currentUser._id, senderId: socketRef.current.id };
        socketRef.current.emit('joinRoom', payload);
        setJoinedRoom(true);
    }, [currentUser, joinedRoom]);

    const leaveRoom = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        socketRef.current.emit('leaveRoom', roomId);
        setJoinedRoom(false);
    }, [currentUser]);

    const sendMessage = useCallback(<T,>(messageBody: T, roomId: string) => {
        const socket = socketRef.current;
        if (socket && roomId) {
            const payload: BasePayload<T> = { roomId, body: messageBody };
            socket.emit('sendMessage', { ...payload, senderId: socket.id, userId: currentUser?._id });
        }
    }, [currentUser, roomId]);

    const startTypingMessage = useCallback(() => {
        const socket = socketRef.current;
        if (socket && roomId) {
            socket.emit('startTyping', { senderId: socket.id, userId: currentUser?._id, roomId });
        }
    }, [currentUser, roomId]);

    const stopTypingMessage = useCallback(() => {
        const socket = socketRef.current;
        if (socket && roomId) {
            socket.emit('stopTyping', { senderId: socket.id, userId: currentUser?._id, roomId });
        }
    }, [currentUser, roomId]);

    useEffect(() => {
        const socket = socketRef.current;

        if (!socket) {
            return;
        }

        const handleUserLeaveChat = (user: User) => {
            setTypingUsers(users => users.filter(u => u.userId !== user.id));
        };

        const handleSendMessageEvent = (message: IGetMessagesResponse) => {
            console.log('handleSendMessageEvent ....');
            setLastMessage(message);
        };

        const handleStartTypingEvent = (userTypingData: TypingInfo) => {
            if (userTypingData.senderId !== socket.id) {
                setTypingUsers(users => [...users, { userId: userTypingData.userId, avatarUrl: userTypingData.avatarUrl, senderId: userTypingData.senderId, isTyping: true }]);
            }
        };

        const handleStopTypingEvent = (userTypingData: TypingInfo) => {
            setTypingUsers(users => users.filter(user => user.userId !== userTypingData.userId));
        };

        socket.on('USER_LEAVE_CHAT_EVENT', handleUserLeaveChat);
        socket.on('SEND_MESSAGE_EVENT', handleSendMessageEvent);
        socket.on('START_TYPING_MESSAGE_EVENT', handleStartTypingEvent);
        socket.on('STOP_TYPING_MESSAGE_EVENT', handleStopTypingEvent);

        return () => {
            socket.off('USER_LEAVE_CHAT_EVENT', handleUserLeaveChat);
            socket.off('SEND_MESSAGE_EVENT', handleSendMessageEvent);
            socket.off('START_TYPING_MESSAGE_EVENT', handleStartTypingEvent);
            socket.off('STOP_TYPING_MESSAGE_EVENT', handleStopTypingEvent);
        };
    }, [currentUser]);

    const changeRoom = useCallback((newRoomId: string | null) => {
        console.log('changeRoom: newRoomId=', newRoomId);
        if (newRoomId !== roomId) {
            console.log('set new room: ', newRoomId);
            setRoomId(newRoomId);
            setJoinedRoom(false);
        }
    }, [roomId]);

    return {
        roomId,
        lastMessage,
        typingUsers,
        sendMessage,
        startTypingMessage,
        stopTypingMessage,
        joinRoom,
        leaveRoom,
        changeRoom,
    };
};

export default useChat;