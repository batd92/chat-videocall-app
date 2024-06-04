import { UseInterceptors, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from, mergeMap, catchError, EMPTY } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { SocketStateService } from '../../core/socket-state/socket-state.service';
import { CreateMessageRequest } from './dto/chat-request.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseInterceptors(RedisPropagatorInterceptor)
export class ChatGateway {

    @WebSocketServer() server: Server;

    constructor(private readonly socketStateService: SocketStateService) { }

    @SubscribeMessage('sendMessage')
    sendMessage(
        @ConnectedSocket() client: Socket, 
        @MessageBody() payload: EnterRoomRequest
    ): Observable<WsResponse<EnterRoomRequest>> {

        return this.roomService.findById(payload.roomId).pipe(
            mergeMap((room) => {
              if (!room) {
                throw new NotFoundException(`Room with ID ${payload.roomId} was not found`);
              }
              this.socketStateService.get(payload.roomId, payload.userId, client);
              return from([{ event: 'startCall', data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
              client.emit('error', error.message);
              return EMPTY;
            }),
          );
        }
        
        this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, client)
        return from([{ event: 'sendMessage', data: payload , userId: payload.userId }]);
    }

    @SubscribeMessage('typingMessage')
    typingMessage(
        @ConnectedSocket() client: Socket, 
        @MessageBody() payload: EnterRoomRequest
    ): Observable<WsResponse<EnterRoomRequest>> {
        this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, client)
        return from([{ event: 'typingMessage', data: payload , userId: payload.userId }]);
    }

    @SubscribeMessage('removeMessage')
    removeMessage(
        @ConnectedSocket() client: Socket, 
        @MessageBody() payload: EnterRoomRequest
    ): Observable<WsResponse<EnterRoomRequest>> {
        this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, client)
        return from([{ event: 'removeMessage', data: payload , userId: payload.userId }]);
    }

    @SubscribeMessage('readLastMessage')
    readLastMessage(
        @ConnectedSocket() client: Socket, 
        @MessageBody() payload: EnterRoomRequest
    ): Observable<WsResponse<EnterRoomRequest>> {
        this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, client)
        return from([{ event: 'readLastMessage', data: payload , userId: payload.userId }]);
    }


    @SubscribeMessage('uploadFile')
    uploadFile(
        @ConnectedSocket() client: Socket, 
        @MessageBody() payload: EnterRoomRequest
    ): Observable<WsResponse<EnterRoomRequest>> {
        this.socketStateService.addUserJoinRoom(payload.roomId, payload.userId, client)
        return from([{ event: 'uploadFile', data: payload , userId: payload.userId }]);
    }
}
