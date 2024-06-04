import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Model, Types } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { MESSAGE_MODEL } from '../../database/constants';
import { Post } from '../../database/schemas/post.schema';
import { CreateMessageDto, LINK, TEXT, VIDEO, FILE } from './dto/create-message.dto';
import { Message } from '../../database/schemas/message.schema';
import { QueryMessageDto } from './dto/query-message.dto';
import { ResMessageDto } from './dto/response.message.dto';

@Injectable({ scope: Scope.REQUEST })
export class MessageService {
    constructor(
        @Inject(MESSAGE_MODEL) private messageModel: Model<Message>,
    ) { }

    findAll(inquery: QueryMessageDto): Observable<ResMessageDto[]> {
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
        ).pipe(
            mergeMap(messages => {
                const replyIds = messages.filter(message => message.replyFromId).map(message => message.replyFromId);
                return this.messageModel.find({ _id: { $in: replyIds } }).exec().then(replyMessages => {
                    const replyMessagesMap = replyMessages.reduce((map, message) => {
                        map.set(message._id.toString(), message);
                        return map;
                    }, new Map<string, any>());

                    return messages.map(message => {
                        const resMessageDto: ResMessageDto = {
                            content: message.content,
                            _id: message._id.toString(),
                            type: message.type,
                            userId: message.userId.toString(),
                            createdAt: (message as any).createdAt,
                            updatedAt: (message as any).updatedAt,
                            replyFromId: message.replyFromId ? {
                                content: replyMessagesMap.get(message.replyFromId.toString()).content,
                                _id: message.replyFromId.toString(),
                                type: replyMessagesMap.get(message.replyFromId.toString()).type,
                                userId: replyMessagesMap.get(message.replyFromId.toString()).userId,
                                createdAt: replyMessagesMap.get(message.replyFromId.toString()).createdAt,
                                updatedAt: replyMessagesMap.get(message.replyFromId.toString()).updatedAt,
                            } : undefined
                        };
                        return resMessageDto;
                    });
                });
            })
        );
    }

    findById(id: string): Observable<Message> {
        return from(this.messageModel.findOne({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
        );
    }

    // from socket
    reciveMessageFromSocket(data: CreateMessageDto): Observable<Message> {
        // TODO
        // Khi có message được gửi từ socket qua thì tạo message vào bảng Message
        // Nếu message là file thì thực hiện save file ở thư mục chỉ định
        // Thông báo cho room cập nhật thông tin cuộc hội thoại vào cache
        const createMessage: Promise<Message> = this.messageModel.create(this.buildMessageRequest(data));

        return from(createMessage);
    }

    deleteById(id: string): Observable<Post> {
        return from(this.messageModel.findOneAndDelete({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p.id) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
        );
    }

    deleteAll(): Observable<any> {
        return from(this.messageModel.deleteMany({}).exec());
    }

    buildMessageRequest(message: any) {
        switch (message.type) {
            case TEXT:
                return {
                    content: message.content,
                    roomId: message.roomId,
                    type: /^(ftp|http|https):\/\/[^ "]+$/.test(message.content.toString()) ? LINK : TEXT,
                    userId: message.userId,
                    replyFromId: message.messageId || ''
                }
            case VIDEO:
                return {
                    content: message.content,
                    roomId: message.roomId,
                    type: message.type,
                    userId: message.userId,
                    replyFromId: message.messageId || ''
                }
            case FILE:
                return {
                    content: message.content,
                    roomId: message.roomId,
                    type: message.type,
                    userId: message.userId,
                    replyFromId: message.messageId || ''
                }
        }
    }

    buildMessageResponse() {

    }
}