import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { MESSAGE_MODEL } from '../../database/constants';
import { LINK, TEXT, VIDEO, FILE } from './dto/create-message.dto';
import { Message } from '../../database/schemas/message.schema';
import { QueryMessageDto } from './dto/query-message.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TextRequest, RemoveMessageRequest, UploadFileRequest, MakeActionRequest } from 'gateway/chat/dto/chat-request.dto';
import { BaseRequest } from 'gateway/base-dto/base.request';

@Injectable({ scope: Scope.REQUEST })
export class MessageService {
    constructor(
        @Inject(MESSAGE_MODEL) private messageModel: Model<Message>,
        private readonly eventEmitter: EventEmitter2
    ) {

    }

    findAll(inquery: QueryMessageDto): Observable<Message[]> {
        let query = this.messageModel.find();

        if (inquery.keyword) {
            query = query.where('title').regex(new RegExp('.*' + inquery.keyword + '.*', 'i'));
        }

        if (inquery.next_cursor) {
            const cursor = (new Types.ObjectId(inquery.next_cursor)).getTimestamp().getTime();
            if (inquery.isJumpToMessages) query = query.where('_id').gte(cursor);
            query = query.where('_id').lt(cursor);
        }

        return from(
            query
                .skip(inquery.skip)
                .limit(inquery.limit)
                .exec(),
        );
    }

    findById(id: string): Observable<Message> {
        return from(this.messageModel.findOne({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`message:$id was not found`)),
        );
    }

    /**
     * Recive message from socket
     * @param data 
     * @returns 
     */
    async onMessageFromSocket(data: TextRequest): Promise<void> {
        const message: Message = await this.messageModel.create(this.buildMessageRequest(data));
        this.eventEmitter.emit('newMessage', message);
    }


    /**
     * Remove message from socket
     * @param data 
     * @returns 
     */
    onRemoveMessageFromSocket(data: RemoveMessageRequest): void {
        this.deleteById(data.messageId);
        this.eventEmitter.emit('removeMessage', data.messageId);
    }

    /**
     * Read last message
     * @param data 
     * @returns 
     */
    onReadLastMessageFromSocket(data: BaseRequest): void {
        this.messageModel.findOneAndUpdate(
            { userId: data.userId, roomId: data.roomId },
            { $set: { indexMessageRead: 0 } },
            { new: true }
        ).exec()
    }

    /**
     * Upload file on socket
     * @param data 
     */
    async onUploadFileFromSocket(data: UploadFileRequest): Promise<void> {
        const message = await this.messageModel.create(this.buildFileRequest(data));
        this.eventEmitter.emit('uploadFile', message);
    }

    /**
     * Make action
     * @param data 
     */
    async onMakeActionMessageFromSocket(data: MakeActionRequest): Promise<void> {

    }

    /**
     * Remove message
     * @param id 
     * @returns 
     */
    deleteById(id: string): Observable<Message> {
        return from(
            this.messageModel.findOneAndUpdate(
                { _id: id },
                { $set: { deletedAt: Date.now() } },
                { new: true }
            ).exec()
        ).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`message: ${id} was not found`)),
        );
    }

    deleteAll(): Observable<any> {
        return from(this.messageModel.deleteMany({}).exec());
    }

    /**
     * Build message request
     * @param message 
     * @returns 
     */
    buildMessageRequest(message: TextRequest) {
        return {
            content: message.content,
            roomId: message.roomId,
            type: /^(ftp|http|https):\/\/[^ "]+$/.test(message.content.toString()) ? LINK : TEXT,
            userId: message.userId,
            replyFromId: message.replyFromId || ''
        }
    }

    /**
     * Build file request
     * @param message 
     * @returns 
     */
    private buildFileRequest(message: UploadFileRequest) {
        return {
            content: message.files,
            roomId: message.roomId,
            type: message.type,
            userId: message.userId,
            replyFromId: message.replyFromId || ''
        };
    }

    /**
     * Build video request
     * @param message 
     * @returns 
     */
    buildCallVideoRequest(message: TextRequest) {
        return {
            content: message.content,
            roomId: message.roomId,
            type: message.type,
            userId: message.userId,
            replyFromId: message.replyFromId || ''
        }
    }
}