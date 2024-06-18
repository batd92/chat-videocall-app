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

    // socket state
    const socketRef = useRef(socketService.getSocket());

    // room selected state
    const [roomId, setRoomId] = useState<string | null>(null);

    // last message state
    const [lastMessage, setLastMessage] = useState<IGetMessagesResponse | null>(null);

    // user typing state
    const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);

    // meeting state
    const [joinedMeeting, setJoinedMeeting] = useState<boolean>(false);

    // data when call
    const [roomTalkingInJitsi, setRoomTalkingInJitsi] = useState<VideoStartResponse | null>(null);

    // connect socket by room state
    const [roomConnectedSocket, setRoomConnectedSocket] = useState<boolean>(false);

    /**
     * Join room
     */
    const joinRoom = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        if (roomConnectedSocket) return;

        const payload = { roomId, userId: currentUser._id, senderId: socketRef.current.id };
        socketRef.current.emit('joinRoom', payload);
        setRoomConnectedSocket(true);
    }, [currentUser, roomConnectedSocket]);

    /**
     * Leave room
     */
    const leaveRoom = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        socketRef.current.emit('leaveRoom', roomId);
        setJoinedMeeting(false);
        setRoomConnectedSocket(false);
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
        if (!socketRef.current || !currentUser || joinedMeeting) return;
        const socket = socketRef.current;
        if (socket && roomId) {
            const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: socket.id };
            socket.emit('startCall', payload);
        }
    }, [currentUser, joinedMeeting]);

    /**
     * Join an existing video call
     */
    const joinCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser || joinedMeeting) return;
        const socket = socketRef.current;
        if (socket && roomId) {
            const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: socket.id };
            socket.emit('joinCall', payload);
            setJoinedMeeting(true);
        }
    }, [currentUser, joinedMeeting]);

    /**
     * Leave a video call
     */
    const leaveCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        const socket = socketRef.current;
        if (socket && roomId) {
            const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: socket.id };
            socket.emit('leaveCall', payload);
            setJoinedMeeting(false);
            setRoomTalkingInJitsi(null);
        }
    }, [currentUser, roomId]);

    /**
     * Reject a video call
     */
    const rejectCall = useCallback((roomId: string) => {
        if (!socketRef.current || !currentUser) return;
        const socket = socketRef.current;
        if (socket && roomId) {
            const payload: VideoCallRequest = { roomId, userId: currentUser._id, senderId: socket.id };
            socket.emit('rejectCall', payload);
            setJoinedMeeting(false);
            setRoomTalkingInJitsi(null);
        }
    }, [currentUser, roomId]);

    // Effect to handle socket events
    useEffect(() => {
        console.log('useEffect ..........');
        const socket = socketRef.current;

        if (!socket) {
            return;
        }

        // Handle user leaving the room
        const handleUserLeaveRoom = (user: User) => {
            setTypingUsers((users) => users.filter((u) => u.userId !== user.id));
            setRoomId(null);
            setJoinedMeeting(false);
            setRoomTalkingInJitsi(null);
            setRoomConnectedSocket(false);
        };

        // Handle receiving a new message
        const handleSendMessageEvent = (message: IGetMessagesResponse) => {
            setLastMessage(message);
        };

        // Handle start typing event
        const handleStartTypingEvent = (userTypingData: TypingInfo) => {
            if (userTypingData.senderId !== socket.id) {
                setTypingUsers((users) => [...users, { userId: userTypingData.userId, avatarUrl: userTypingData.avatarUrl, senderId: userTypingData.senderId, isTyping: true }]);
            }
        };

        // Handle stop typing event
        const handleStopTypingEvent = (userTypingData: TypingInfo) => {
            setTypingUsers((users) => users.filter((user) => user.userId !== userTypingData.userId));
        };

        // Handle start call event
        const handleStartCallEvent = (data: VideoStartResponse) => {
            console.log('on start call event ... ');
            setRoomTalkingInJitsi(data);
            setJoinedMeeting(true);
        };

        // Handle join call event
        const handleJoinCallEvent = () => {
            // join room success -> set state
            setRoomConnectedSocket(true);
            setJoinedMeeting(true);
        };

        // Handle leave call event
        const handleLeaveCallEvent = (data: { roomId: string }) => {
            if (data.roomId === roomId) {
                setJoinedMeeting(false);
            }
        };

        // Handle reject call event
        const handleRejectCallEvent = (data: { roomId: string }) => {
            if (data.roomId === roomId) {
                setJoinedMeeting(false);
                setRoomTalkingInJitsi(null);
            }
        };

        socket.on('USER_LEAVE_CHAT_EVENT', handleUserLeaveRoom);
        socket.on('SEND_MESSAGE_EVENT', handleSendMessageEvent);
        socket.on('START_TYPING_MESSAGE_EVENT', handleStartTypingEvent);
        socket.on('STOP_TYPING_MESSAGE_EVENT', handleStopTypingEvent);
        socket.on('START_CALL_EVENT', handleStartCallEvent);
        socket.on('JOIN_CALL_EVENT', handleJoinCallEvent);
        socket.on('LEAVE_CALL_EVENT', handleLeaveCallEvent);
        socket.on('REJECT_CALL_EVENT', handleRejectCallEvent);

        // Cleanup on component unmount
        return () => {
            socket.off('USER_LEAVE_CHAT_EVENT', handleUserLeaveRoom);
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
            setJoinedMeeting(false);
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
        joinedMeeting,
        setRoomTalkingInJitsi,
        startCall,
        joinCall,
        leaveCall,
        rejectCall,
    };
};

export default useChat;