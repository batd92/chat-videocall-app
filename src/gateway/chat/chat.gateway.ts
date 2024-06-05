import { UseInterceptors, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from, mergeMap, catchError, EMPTY } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { BaseRequest, UploadFileRequest, MessageRequest, RemoveMessageRequest } from './dto/chat-request.dto';
import { MessageResponse } from './dto/chat-reponse.dto';
import { RoomService } from '../../modules/room/room.service';
import { MessageService } from '../../modules/message/message.service';
import { Room } from 'database/schemas/room.schema';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseInterceptors(RedisPropagatorInterceptor)
export class ChatGateway {

    @WebSocketServer() server: Server;

    constructor(
        private readonly roomService: RoomService,
        private readonly messageService: MessageService,
    ) { }

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

    @SubscribeMessage('sendMessage')
    sendMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: MessageRequest
    ): Observable<WsResponse<MessageResponse>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onMessageFromSocket(payload);
                return from([{ event: 'sendMessage', data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    @SubscribeMessage('typingMessage')
    typingMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BaseRequest
    ): Observable<WsResponse<BaseRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                return from([{ event: 'typingMessage', data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    @SubscribeMessage('removeMessage')
    removeMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RemoveMessageRequest
    ): Observable<WsResponse<RemoveMessageRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onRemoveMessageFromSocket(payload);
                return from([{ event: 'removeMessage', data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    @SubscribeMessage('readLastMessage')
    readLastMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BaseRequest
    ): Observable<WsResponse<BaseRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onReadLastMessageFromSocket(payload);
                return from([{ event: 'readLastMessage', data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }


    @SubscribeMessage('uploadFile')
    uploadFile(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UploadFileRequest
    ): Observable<WsResponse<UploadFileRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onUploadFileFromSocket(payload);
                return from([{ event: 'sendMessage', data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }
}