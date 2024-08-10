import { ISocket, IUserameSocket, IRoomState, IUserSocket } from "./interface/socket";
import { Socket } from "socket.io";
import { VideoCallRequest } from "../../gateway/video-call/dto/video-call.request.dto";
import { IParticipant } from "gateway/chat/interface/base";

export class SocketStateService {
    private socketsByRoomId = new Map<string, Array<IUserameSocket>>();
    private socketsByUserId = new Map<string, Array<string>>();
    private socketState = new Map<string, ISocket>();
    private socketRoomState = new Map<string, string>();
    private roomStatesById = new Map<string, IRoomState>();

    /**
     * Connect socket
     * @param userId 
     * @param socket 
     * @returns 
     */
    public addSocket(userId: string, socket: ISocket): boolean {
        const socketByUser = this.socketsByUserId.get(userId) || [];
        const existingSocket = socketByUser.find(id => id === socket.id);
        if (existingSocket) return false;
        this.socketsByUserId.set(userId, [...socketByUser, socket.id]);
    }

    /**
     * User join room
     * @param roomId 
     * @param userId 
     * @param socket 
     * @param participants 
     * @returns 
     */
    public addUserJoinRoom(roomId: string, userId: string, socket: Socket, participants: IParticipant[]): boolean {
        const roomUsernameSockets = this.socketsByRoomId.get(roomId) || [];
        const existingUsernameRecord = roomUsernameSockets.find(us => us.userId === userId && us.socketId === socket.id);
        if (existingUsernameRecord) return false;

        this.socketsByRoomId.set(roomId, [...roomUsernameSockets, { username: '', socketId: socket.id, userId }]);
        this.socketState.set(socket.id, socket);
        this.socketRoomState.set(socket.id, roomId);
        console.log('Room: ', this.socketsByRoomId.get(roomId));
        if (!this.getRoomState(roomId)) {
            this.setRoomState(roomId, participants);
        }
    }

    /**
     * Disconnect or user leave room
     * @param socket 
     */
    public removeSocket(socket: ISocket) {
        const roomId = this.socketRoomState.get(socket.id);
        if (roomId) {
            const usernameSockets = this.socketsByRoomId.get(roomId) || [];
            const socketIds = usernameSockets.map(us => us.socketId);

            if (socketIds.length > 1) {
                this.socketsByRoomId.set(roomId, usernameSockets.filter(rus => rus.socketId !== socket.id));
            } else {
                this.socketsByRoomId.delete(roomId);
            }
        }
        this.socketState.delete(socket.id);
        this.socketRoomState.delete(socket.id);
    }

    public getAllSocketForRoomExcludingUsername(roomId: string, username: string): Array<ISocket> {
        const usernameSockets = this.socketsByRoomId.get(roomId) || [];
        return usernameSockets.filter(us => us.username !== username).map(us => this.socketState.get(us.socketId))
    }

    public getAllSocketForRoom(roomId: string): Array<IUserameSocket> {
        console.log('getAllSocketForRoom ', this.socketsByRoomId.get(roomId), roomId);
        const socketByRoom = this.socketsByRoomId.get(roomId);
        return socketByRoom;
    }

    public getRoomState(roomId: string): IRoomState {
        return this.roomStatesById.get(roomId);
    }

    public setRoomState(roomId: string, participants: IParticipant[]): void {
        const roomState = {
            jitsiName: '',
            jitsiToken: '',
            userOnlines: [],
            userJoined: [],
            hostId: '',
            userRejecteds: [],
            inRoom: [],
            owner: '',
            ownerVideoCall: '',
            participants
        }
        this.roomStatesById.set(roomId, roomState);
    }

    public updateRoomState(payload: VideoCallRequest, socket: Socket, jitsiToken: string, jitsiName: string): void {
        const room = this.roomStatesById.get(payload.roomId);
        room.jitsiToken = jitsiToken;
        room.jitsiName = jitsiName;
        room.ownerVideoCall = payload.userId;

        room.inRoom.push({
            userId: payload.userId,
            socketId: socket.id
        });
        this.roomStatesById.set(payload.roomId, room);
    }

    public updateRoomUserJoin(payload: VideoCallRequest, socket: Socket): void {
        const room = this.roomStatesById.get(payload.roomId);
        room.userJoined.push({
            userId: payload.userId,
            socketId: socket.id
        });

        room.inRoom.push({
            userId: payload.userId,
            socketId: socket.id
        });
        this.roomStatesById.set(payload.roomId, room);
    }

    public updateRoomUserLeave(payload: VideoCallRequest, socket: Socket): IRoomState | undefined {
        const room = this.roomStatesById.get(payload.roomId);
        if (room) {
            room.userJoined = [...(room.userJoined.filter(us => us.userId != payload.userId))];

            if (room.userJoined.length <= 1) {
                room.jitsiName = '';
                room.jitsiToken = '';
                room.userJoined.length = 0;
                room.userRejecteds.length = 0;
                room.inRoom.length = 0;
            }
            this.roomStatesById.set(payload.roomId, room);
            return room;
        }
    }

    public resetRoomUserLeave(payload: VideoCallRequest, socket: Socket): IRoomState | undefined {
        const room = this.roomStatesById.get(payload.roomId);
        if (room) {
            if (room.ownerVideoCall === payload.userId) {
                if (room.userJoined.length <= 1) {
                    room.ownerVideoCall = '';
                    room.jitsiName = '';
                    room.jitsiToken = '';
                    room.userJoined.length = 0;
                    room.userRejecteds.length = 0;
                    room.inRoom.length = 0;
                }
            }
            room.userJoined = [...(room.userJoined.filter(us => us.userId != payload.userId))];
            this.roomStatesById.set(payload.roomId, room);
            return room;
        }
    }
}