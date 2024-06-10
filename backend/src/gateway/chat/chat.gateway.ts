import { UseInterceptors, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Observable, from, mergeMap, catchError, EMPTY } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from '../../core/redis-propagator/redis-propagator.interceptor';
import { UploadFileRequest, TextRequest, RemoveMessageRequest, MakeActionRequest } from './dto/chat-request.dto';
import { BaseRequest } from '../base-dto/base.request';
import { RoomService } from '../../modules/room/room.service';
import { MessageService } from '../../modules/message/message.service';
import { Room } from 'database/schemas/room.schema';
import { SubscribeEvent } from '../base-dto/subscribe.message';
import {
    SEND_MESSAGE_EVENT,
    TYPING_MESSAGE_EVENT,
    READ_LAST_MESSAGE_EVENT,
    UPLOAD_FILE_EVENT,
    REMOVE_MESSAGE_EVENT,
    MAKE_ACTION_MESSAGE_EVENT
} from '../base-dto/base.event';
import { FileInterceptor } from '@nestjs/platform-express';

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
    ) {
        console.log('RoomService:', this.roomService);  // Log to check injection
        console.log('MessageService:', this.messageService);  // Log to check injection
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

    /**
     * Send message
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.sendMessage)
    sendMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: TextRequest
    ): Observable<WsResponse<TextRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onMessageFromSocket(payload);
                return from([{ event: SEND_MESSAGE_EVENT, data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Typing message
     */
    @SubscribeMessage(SubscribeEvent.typingMessage)
    typingMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BaseRequest
    ): Observable<WsResponse<BaseRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                return from([{ event: TYPING_MESSAGE_EVENT, data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Remove message
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.removeMessage)
    removeMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RemoveMessageRequest
    ): Observable<WsResponse<RemoveMessageRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onRemoveMessageFromSocket(payload);
                return from([{ event: REMOVE_MESSAGE_EVENT, data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Read last message
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.readLastMessage)
    readLastMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BaseRequest
    ): Observable<WsResponse<BaseRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onReadLastMessageFromSocket(payload);
                return from([{ event: READ_LAST_MESSAGE_EVENT, data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Upload file
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.uploadFile)
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UploadFileRequest
    ): Observable<WsResponse<UploadFileRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                return from(this.messageService.onUploadFileFromSocket(payload)).pipe(
                    mergeMap(() => from([{ event: UPLOAD_FILE_EVENT, data: payload, userId: payload.userId }])),
                    catchError((error) => {
                        socket.emit('error', error.message);
                        return EMPTY;
                    }),
                );
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }

    /**
     * Make action
     * @param socket 
     * @param payload 
     * @returns 
     */
    @SubscribeMessage(SubscribeEvent.makeAction)
    makeAction(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: MakeActionRequest
    ): Observable<WsResponse<MakeActionRequest>> {
        return this.roomService.findOne(payload.roomId).pipe(
            mergeMap((room) => {
                this.checkRoom(room, payload.userId);
                this.messageService.onMakeActionMessageFromSocket(payload);
                return from([{ event: MAKE_ACTION_MESSAGE_EVENT, data: payload, userId: payload.userId }]);
            }),
            catchError((error) => {
                socket.emit('error', error.message);
                return EMPTY;
            }),
        );
    }
}