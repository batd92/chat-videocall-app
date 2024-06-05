import { UseInterceptors, OnModuleInit, NotFoundException, UnauthorizedException, BadGatewayException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from, mergeMap, catchError, EMPTY, of } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { SocketStateService } from '../../core/socket-state/socket-state.service';
import { VideoCallRequest } from './dto/video-call.request.dto';
import { VideoCallResponse } from './dto/video-call.response.dto';
import { RoomService } from '../../modules/room/room.service';
import { JitsiorgService } from '../jitsi.org/jitsi.org.service';
import { START_CALL_EVENT, JOIN_CALL_EVENT, LEAVE_CALL_EVENT, CANCEL_CALL_EVENT, END_CALL_EVENT } from './events/event';
import { Room } from 'database/schemas/room.schema';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseInterceptors(RedisPropagatorInterceptor)
export class VideoCallGateway {

    @WebSocketServer() server: Server;

    constructor(
        private readonly socketStateService: SocketStateService,
        private readonly roomService: RoomService,
        private readonly jitsiorgService: JitsiorgService,
    ) { }

    @SubscribeMessage(START_CALL_EVENT)
    startCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallRequest>> {
        return from(this.roomService.findOne(payload.roomId)).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.getRoomState(payload, client);
                if (roomDB.jitsiToken) {
                    throw new BadGatewayException(`Room started with room call.`);
                }

                // get Jitsi Token
                const jitsiToken = await this.jitsiorgService.getInfoJitsi(payload);

                // update cache
                this.socketStateService.updateRoomState(payload, client, jitsiToken.token, jitsiToken.roomName);

                return { event: START_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: jitsiToken.token };
            }),
            catchError((error) => {
                client.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    @SubscribeMessage(JOIN_CALL_EVENT)
    joinCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallResponse>> {
        return from(this.roomService.findById(payload.roomId)).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.getRoomState(payload, client);
                if (roomDB.jitsiToken == 'incall') {
                    throw new NotFoundException(`Room started with room call.`);
                }
                // update cache
                this.socketStateService.updateRoomUserJoin(payload, client);

                return from([{ event: JOIN_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: roomDB.jitsiToken }]);
            }),
            catchError((error) => {
                client.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    @SubscribeMessage(LEAVE_CALL_EVENT)
    leaveCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallResponse>> {
        return from(this.roomService.findById(payload.roomId)).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.updateRoomUserLeave(payload, client);
                if (!roomDB) {
                    throw new NotFoundException(`Room not found.`);
                }

                if (roomDB.userJoined.length <= 1) {
                    return from([{ event: END_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: roomDB.jitsiToken }]);
                }
                return from([{ event: LEAVE_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: room.jitsiToken }]);
            }),
            catchError((error) => {
                client.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    @SubscribeMessage(CANCEL_CALL_EVENT)
    cancelCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallResponse>> {
        return from(this.roomService.findById(payload.roomId)).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);
                const roomDB = this.socketStateService.resetRoomUserLeave(payload, client);
                if (!roomDB) {
                    throw new NotFoundException(`Room not found.`);
                }

                if (roomDB.userJoined.length <= 1) {
                    return from([{ event: END_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: roomDB.jitsiToken }]);
                }
                return from([{ event: LEAVE_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: roomDB.jitsiToken }]);
            }),
            catchError((error) => {
                client.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    private checkRoom(room: Room, userId: string) {
        if (!room) {
            throw new NotFoundException(`room was not found`);
        }
        // check user in room
        const participants = room.participants.map(pr => pr._id);

        if (!participants.includes(userId)) {
            throw new UnauthorizedException(`Unauthorized exception`);
        }
    }
}
