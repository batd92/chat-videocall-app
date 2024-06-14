import { UseInterceptors, OnModuleInit, NotFoundException, UnauthorizedException, BadGatewayException, ForbiddenException, Inject } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from, mergeMap, catchError, EMPTY, of } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { SocketStateService } from '../../core/socket-state/socket-state.service';
import { VideoCallRequest } from './dto/video-call.request.dto';
import { RoomService } from '../../modules/room/room.service';
import { JitsiorgService } from '../jitsi.org/jitsi.org.service';
import { Room } from 'database/schemas/room.schema';
import { SubscribeEvent } from '../base-dto/subscribe.message';
import { 
    START_CALL_EVENT,
    JOIN_CALL_EVENT,
    LEAVE_CALL_EVENT,
    REJECT_CALL_EVENT,
    END_CALL_EVENT 
} from '../base-dto/base.event';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseInterceptors(RedisPropagatorInterceptor)
export class VideoCallGateway {

    @WebSocketServer() server: Server;

    constructor(
        private readonly roomService: RoomService,
        private readonly jitsiorgService: JitsiorgService,
        private readonly socketStateService: SocketStateService,
    ) {
        console.log('socketStateService ', socketStateService)
     }

    /**
     * Start the call
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.startCall)
    startCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.getRoomState(payload, socket);
                if (roomDB.jitsiToken) {
                    throw new BadGatewayException(`Room started with room call.`);
                }
                // get Jitsi Token
                const jitsiToken = await this.jitsiorgService.getInfoJitsi(payload);
                return { event: START_CALL_EVENT, data: payload, userId: payload.userId, jitsiToken: jitsiToken.token, roomId: payload.roomId };
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Answer the call
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.joinCall)
    joinCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.getRoomState(payload, socket);

                if (!roomDB.jitsiToken) {
                    throw new ForbiddenException(`The call has ended`);
                }

                if (roomDB.userJoined.find(u => u.userId === payload.userId)) {
                    throw new BadGatewayException(`User in call.`);
                }
                return { event: JOIN_CALL_EVENT, data: payload, userId: payload.userId, roomId: payload.roomId };
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Leave the call
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.leaveCall)
    leaveCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.getRoomState(payload, socket);

                if (!roomDB.jitsiToken) {
                    throw new ForbiddenException(`The call has ended`);
                }

                if (!(roomDB.userJoined.find(u => u.userId === payload.userId))) {
                    throw new BadGatewayException(`User don't in call.`);
                }

                let eventName = LEAVE_CALL_EVENT;
                if (roomDB.userJoined.filter(us => us.userId !== payload.userId).length <= 1) {
                    eventName = END_CALL_EVENT;
                }
                return { event: eventName, data: payload, userId: payload.userId, roomId: payload.roomId };
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Reject the call
     * @param client 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.rejectCall)
    rejectCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: VideoCallRequest
    ): Observable<WsResponse<VideoCallRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap(async (room) => {
                this.checkRoom(room, payload.userId);

                const roomDB = this.socketStateService.getRoomState(payload, socket);

                if (!roomDB.jitsiToken) {
                    throw new ForbiddenException(`The call has ended`);
                }

                if ((roomDB.userJoined.find(u => u.userId === payload.userId))) {
                    throw new BadGatewayException(`User in call.`);
                }
                return { event: REJECT_CALL_EVENT, data: payload, userId: payload.userId, roomId: payload.roomId };
            }),
            catchError((error) => {
                socket.emit('error', error.message);
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
