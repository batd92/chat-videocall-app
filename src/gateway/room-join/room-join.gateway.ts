import { UseInterceptors, OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { SocketStateService } from '../../core/socket-state/socket-state.service';
import { EnterRoomRequest } from './dto/join-room.request.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseInterceptors(RedisPropagatorInterceptor)
export class EventsGateway {

    @WebSocketServer() server: Server;

    constructor(private readonly socketStateService: SocketStateService) { }

    @SubscribeMessage('joinRoom')
    joinRoom(
        @ConnectedSocket() client: Socket, 
        @MessageBody() payload: EnterRoomRequest
    ): Observable<WsResponse<EnterRoomRequest>> {
        this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, client)
        return from([{ event: 'joinRoom', data: payload , userId: payload.userId }]);
    }
}
