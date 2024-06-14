import { UseInterceptors, NotFoundException, UnauthorizedException, Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from, mergeMap, catchError, EMPTY } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { RoomService } from '../../modules/room/room.service';
import { IRoom } from './interface/base';
import { BaseRequest } from '../base-dto/base.request';
import { SocketStateService } from '../../core/socket-state/socket-state.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseInterceptors(RedisPropagatorInterceptor)
@Injectable()
export class JoinRoomGateway {

    @WebSocketServer() server: Server;

    constructor(
        private readonly roomService: RoomService,
        private readonly socketStateService: SocketStateService,
    ) {
    }

    private checkRoom(room: IRoom, userId: string) {
        if (!room) {
            throw new NotFoundException(`room was not found`);
        }
        // check user in room
        const participants = room.participants.map(pr => pr._id);
        if (!participants.includes(userId)) {
            throw new UnauthorizedException(`Unauthorized exception`);
        }
    }

    /**
     * Send message
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage('joinRoom')
    joinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BaseRequest
    ): Observable<WsResponse<BaseRequest>> {
        console.log('payload', payload)
        return this.roomService.getParticipantsByRoom(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, socket);
                return from([{ event: 'joinRoom', data: payload, userId: payload.userId, roomId: payload.roomId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }
}