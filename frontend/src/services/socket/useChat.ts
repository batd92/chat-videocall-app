import { useEffect, useRef, useState } from "react";
import { getSocket, closeSocket } from "./socket-manager";
import { User, TypingInfo, Message } from "./types";
import { useAuth } from "@/providers/auth/index";
import { IGetMessagesResponse } from "@/interface/response/message/index";
import { ITypingUser } from "@/interface/common";

interface BasePayload<T> {
    roomId: string;
    body: T;
}

export default function useChat(roomId: string) {
    const [lastMessage, setLastMessage] = useState<IGetMessagesResponse>();
    const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
    const { currentUser } = useAuth();
    const socketRef = useRef(getSocket());

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        socketRef.current.on('USER_LEAVE_CHAT_EVENT', (user: User) => {
            // TODO: Read last message by roomId
        });

        socketRef.current.on('SEND_MESSAGE_EVENT', (message: IGetMessagesResponse) => {
            console.log('Send message event:', message);
            const incomingMessage = { ...message };
            setLastMessage(incomingMessage);
        });

        socketRef.current.on('START_TYPING_MESSAGE_EVENT', (userTypingData: TypingInfo) => {
            if (userTypingData.senderId !== socketRef.current!.id) {
                const userTyping: ITypingUser = {
                    userId: userTypingData.userId,
                    avatarUrl: userTypingData.avatarUrl,
                    senderId: userTypingData.senderId,
                    isTyping: true
                }
                setTypingUsers((users: ITypingUser[]) => [...users, userTyping]);
            }
        });

        socketRef.current.on('STOP_TYPING_MESSAGE_EVENT', (userTypingData: TypingInfo) => {
            if (userTypingData.senderId !== socketRef.current!.id) {
                setTypingUsers((users: ITypingUser[]) =>
                    users.filter((user) => user.userId !== userTypingData.userId)
                );
            }
        });

        socketRef.current.on('READ_LAST_MESSAGE_EVENT', (userTypingData: TypingInfo) => {
            if (userTypingData.senderId !== socketRef.current!.id) {
                // TODO: Read last message by roomId
            }
        });

        socketRef.current.on('joinRoom', (joinRoom: any) => {
            console.log('Join room event:', joinRoom);
            if (joinRoom.senderId !== socketRef.current!.id) {
                const user = joinRoom.userId;
            }
        });

        // Cleanup on component unmount
        return () => {
            closeSocket();
        };
    }, [currentUser]);

    /**
     * Emit event join room
     */
    const joinRoom = () => {
        if (socketRef.current) {
            const payload = {
                roomId,
                userId: currentUser?._id,
                senderId: socketRef.current.id
            };
            socketRef.current.emit('joinRoom', payload);
        }
    };

    /**
     * Emit event send message
     */
    const sendMessage = <T,>(messageBody: T) => {
        if (socketRef.current) {
            const payload: BasePayload<T> = {
                roomId,
                body: messageBody
            };
            socketRef.current.emit('sendMessage', {
                ...payload,
                senderId: socketRef.current.id,
                userId: currentUser?._id
            });
        }
    };

    /**
     * Emit event start typing
     */
    const startTypingMessage = () => {
        if (socketRef.current) {
            socketRef.current.emit('startTyping', {
                senderId: socketRef.current.id,
                userId: currentUser?._id,
                roomId
            });
        }
    };

    /**
     * Emit event stop typing
     */
    const stopTypingMessage = () => {
        if (socketRef.current) {
            socketRef.current.emit('stopTyping', {
                senderId: socketRef.current.id,
                userId: currentUser?._id,
                roomId
            });
        }
    };

    return {
        lastMessage,
        currentUser,
        typingUsers,
        setLastMessage,
        sendMessage,
        startTypingMessage,
        stopTypingMessage,
        joinRoom,
    };
}
