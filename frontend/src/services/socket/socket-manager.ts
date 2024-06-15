import { getCookie } from "@/utils/helpers/storage";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        const token = getCookie('access_token') || '';
        socket = io(process.env.NEXT_PUBLIC_URL_SOCKET || 'http://localhost:3000', {
            query: {
                token
            }
        });

        socket.on("connect", () => {
            console.log('Connected with socket id:', socket!.id);
        });

        socket.on("connect_error", (error: any) => {
            console.error('Connection error:', error);
        });

        socket.on("disconnect", (reason: any) => {
            console.log('Disconnected:', reason);
        });
    }

    return socket;
};

export const closeSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
