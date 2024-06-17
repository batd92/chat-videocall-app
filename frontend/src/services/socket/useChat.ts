import { useEffect, useRef, useState, useCallback } from "react";
import { User, TypingInfo } from "./types";
import { useAuth } from "@/providers/auth/index";
import { IGetMessagesResponse } from "@/interface/response/message/index";
import { ITypingUser } from "@/interface/common";
import SocketService from './socket-manager';

const socketService = SocketService.getInstance();

interface BasePayload<T> {
    roomId: string;
    body: T;
}
interface VideoCallRequest {
    roomId: string;
    userId: string;
    senderId: string;
}

export interface VideoStartResponse {
    roomId: string;
    ownerId: string;
    senderId: string;
    jitsiToken: string;
    socketId: string;
    roomName: string;
}

const useChat = () => {
    const { currentUser } = useAuth();
    const socketRef = useRef(socketService.getSocket());
    const [roomId, setRoomId] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<IGetMessagesResponse | null>(null);
    const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
    const [joinedRoom, setJoinedRoom] = useState<boolean>(false);
    const [roomTalkingInJitsi, setRoomTalkingInJitsi] = useState<VideoStartResponse | null>(null);

    /**
     * Join room
     */
    const joinRoom = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser || joinedRoom) return;
        const payload = { roomId, userId: currentUser._id, senderId: socketRef.current.id };
        socketRef.current.emit('joinRoom', payload);
        setJoinedRoom(true);
    }, [currentUser, joinedRoom]);

    /**
     * Leave room
     */
    const leaveRoom = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        socketRef.current.emit('leaveRoom', roomId);
        setJoinedRoom(false);
    }, [currentUser]);

    /**
     * Send message
     */
    const sendMessage = useCallback(<T,>(messageBody: T, roomId: string) => {
        const socket = socketRef.current;
        if (socket && roomId) {
            const payload: BasePayload<T> = { roomId, body: messageBody };
            socket.emit('sendMessage', { ...payload, senderId: socket.id, userId: currentUser?._id });
        }
    }, [currentUser, roomId]);

    /**
     * Start typing message
     */
    const startTypingMessage = useCallback(() => {
        const socket = socketRef.current;
        if (socket && roomId) {
            socket.emit('startTyping', { senderId: socket.id, userId: currentUser?._id, roomId });
        }
    }, [currentUser, roomId]);

    /**
     * Stop typing message
     */
    const stopTypingMessage = useCallback(() => {
        const socket = socketRef.current;
        if (socket && roomId) {
            socket.emit('stopTyping', { senderId: socket.id, userId: currentUser?._id, roomId });
        }
    }, [currentUser, roomId]);

    /**
     * Start a video call
     */
    const startCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser || joinedRoom) return;
        const senderId = socketRef.current.id || '';
        const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: senderId };
        socketRef.current.emit('startCall', payload);
    }, [currentUser, joinedRoom]);

    /**
     * Join an existing video call
     */
    const joinCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser || joinedRoom) return;
        const senderId = socketRef.current.id || '';
        const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: senderId };
        socketRef.current.emit('joinCall', payload);
        setJoinedRoom(true);
    }, [currentUser, joinedRoom]);

    /**
     * Leave a video call
     */
    const leaveCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        const senderId = socketRef.current.id || '';
        const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: senderId };
        socketRef.current.emit('leaveCall', payload);
        setJoinedRoom(false);
        setRoomTalkingInJitsi(null);
    }, [currentUser]);

    /**
     * Reject a video call
     */
    const rejectCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        const senderId = socketRef.current.id || '';
        const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: senderId };
        socketRef.current.emit('rejectCall', payload);
    }, [currentUser]);



    useEffect(() => {
        console.log('useEffect ..........')
        const socket = socketRef.current;

        if (!socket) {
            return;
        }

        const handleUserLeaveChat = (user: User) => {
            setTypingUsers((users: any) => users.filter((u: any) => u.userId !== user.id));
        };

        const handleSendMessageEvent = (message: IGetMessagesResponse) => {
            setLastMessage(message);
        };

        const handleStartTypingEvent = (userTypingData: TypingInfo) => {
            if (userTypingData.senderId !== socket.id) {
                setTypingUsers((users: any) => [...users, { userId: userTypingData.userId, avatarUrl: userTypingData.avatarUrl, senderId: userTypingData.senderId, isTyping: true }]);
            }
        };

        const handleStopTypingEvent = (userTypingData: TypingInfo) => {
            setTypingUsers((users: any) => users.filter((user: any) => user.userId !== userTypingData.userId));
        };

        const handleStartCallEvent = (data: any) => {
            console.log('on start call event ... ',  data);
            setRoomTalkingInJitsi(data);
            setRoomId(data.roomId);
        };

        const handleJoinCallEvent = (data: { roomId: string }) => {
            setRoomId(data.roomId);
            setJoinedRoom(true);
        };

        const handleLeaveCallEvent = (data: { roomId: string }) => {
            if (data.roomId === roomId) {
                setRoomId(null);
                setJoinedRoom(false);
                setRoomTalkingInJitsi(null);
            }
        };

        const handleRejectCallEvent = (data: { roomId: string }) => {
            if (data.roomId === roomId) {
                setRoomId(null);
            }
        };

        socket.on('USER_LEAVE_CHAT_EVENT', handleUserLeaveChat);
        socket.on('SEND_MESSAGE_EVENT', handleSendMessageEvent);
        socket.on('START_TYPING_MESSAGE_EVENT', handleStartTypingEvent);
        socket.on('STOP_TYPING_MESSAGE_EVENT', handleStopTypingEvent);
        socket.on('START_CALL_EVENT', handleStartCallEvent);
        socket.on('JOIN_CALL_EVENT', handleJoinCallEvent);
        socket.on('LEAVE_CALL_EVENT', handleLeaveCallEvent);
        socket.on('REJECT_CALL_EVENT', handleRejectCallEvent);

        // Cleanup on component unmount
        return () => {
            socket.off('USER_LEAVE_CHAT_EVENT', handleUserLeaveChat);
            socket.off('SEND_MESSAGE_EVENT', handleSendMessageEvent);
            socket.off('START_TYPING_MESSAGE_EVENT', handleStartTypingEvent);
            socket.off('STOP_TYPING_MESSAGE_EVENT', handleStopTypingEvent);
            socket.off('START_CALL_EVENT', handleStartCallEvent);
            socket.off('JOIN_CALL_EVENT', handleJoinCallEvent);
            socket.off('LEAVE_CALL_EVENT', handleLeaveCallEvent);
            socket.off('REJECT_CALL_EVENT', handleRejectCallEvent);
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
        roomTalkingInJitsi,
        joinedRoom,
        setRoomTalkingInJitsi,
        startCall,
        joinCall,
        leaveCall,
        rejectCall,
    };
};

export default useChat;