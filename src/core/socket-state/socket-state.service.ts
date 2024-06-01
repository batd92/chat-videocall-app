import { Injectable } from "@nestjs/common";
import { v4 } from 'uuid';

import { ISocket, IUserameSocket } from "./interface/socket";
import { Socket } from "socket.io";

@Injectable()
export class SocketStateService {

    // trạng thái socket by roomId
    private roomUsernameSockets = new Map<string, Array<IUserameSocket>>();

    // trạng thái socket by userId
    private socketIdsState = new Map<string, Array<string>>();

    // trang thái socket theo id
    private socketState = new Map<string, ISocket>();

    // trạng thái của room
    private socketRoomState = new Map<string, string>();

    public addSocket(userId: string, socket: ISocket): boolean {
        //socket.id = v4();

        const sockets = this.socketIdsState.get(userId) || [];
        const existingSocket = sockets.find(id => id === socket.id);
        if (existingSocket) return false;

        this.socketIdsState.set(userId, [...sockets, socket.id]);
        console.log('socket connected ...', sockets);
    }

    public addUserJoinRoom(roomId: string, userId: string, socket: Socket): boolean {
        //socket.id = v4();
        console.log(socket);
        const roomUsernameSockets = this.roomUsernameSockets.get(roomId) || [];
        if (roomUsernameSockets.length > 1) {
            return false;
        }
        const existingUsernameRecord = roomUsernameSockets.find(us => us.userId === userId);
        if (existingUsernameRecord) return false;

        this.roomUsernameSockets.set(roomId, [...roomUsernameSockets, { username: '', socketId: socket.id, userId }]);
        this.socketState.set(socket.id, socket);
        this.socketRoomState.set(socket.id, roomId);
    }

    public removeSocket(socket: ISocket) {
        const roomId = this.socketRoomState.get(socket.id);
        if (roomId) {
            const usernameSockets = this.roomUsernameSockets.get(roomId) || [];
            const socketIds = usernameSockets.map(us => us.socketId);

            if (socketIds.length > 1) {
                this.roomUsernameSockets.set(roomId, usernameSockets.filter(rus => rus.socketId !== socket.id));
            } else {
                this.roomUsernameSockets.delete(roomId);
            }
        }
        this.socketState.delete(socket.id);
        this.socketRoomState.delete(socket.id);
    }

    public getAllSocketForRoomExcludingUsername(roomId: string, username: string): Array<ISocket> {
        const usernameSockets = this.roomUsernameSockets.get(roomId) || [];
        return usernameSockets.filter(us => us.username !== username).map(us => this.socketState.get(us.socketId))
    }

    public getAllSocketForRoom(roomId: string) : Array<IUserameSocket> {
        return this.roomUsernameSockets.get(roomId);
    }
}