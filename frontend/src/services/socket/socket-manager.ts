import { getCookie } from "@/utils/helpers/storage";
import { io, Socket } from "socket.io-client";

class SocketService {
    private static instance: SocketService | null = null;
    private socket: Socket | null = null;

    private constructor() {
        // Prevent external instantiation
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
            SocketService.instance.initSocket();
        }
        return SocketService.instance;
    }

    private initSocket() {
        const token = getCookie('access_token') || '';
        
        if (!token) {
            console.error('Access token not found, unable to establish socket connection.');
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET || 'http://localhost:3000';

        this.socket = io(socketUrl, {
            reconnectionDelayMax: 10000,
            query: {
                token
            }
        });

        this.socket.on("connect", () => {
            console.log('Connected to socket with id:', this.socket!.id);
        });
        
        this.socket.on("connect_error", (error: any) => {
            console.error('Connection error:', error);
        });
        
        this.socket.on("disconnect", (reason: any) => {
            console.log('Disconnected:', reason);
        });
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public closeSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default SocketService;
