import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Model, Types } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { MESSAGE_MODEL } from '../../database/constants';
import { Post } from '../../database/schemas/post.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from '../../database/schemas/message.schema';

@Injectable({ scope: Scope.REQUEST })
export class MessageService {
    constructor(
        @Inject(MESSAGE_MODEL) private messageModel: Model<Message>,
        @Inject(REQUEST) private req: AuthenticatedRequest,
    ) { }

    findAllByConversationId(keyword?: string, skip = 0, limit = 10, next_cursor = ''): Observable<Message[]> {
        let query = this.messageModel.find();

        if (keyword) {
            query = query.where('title').regex(new RegExp('.*' + keyword + '.*', 'i'));
        }

        if (next_cursor) {
            const timestampCursor  = (new Types.ObjectId(next_cursor)).getTimestamp().getTime();
            query = query.where('_id').lt(timestampCursor);
        }

        return from(
            query
                .skip(skip)
                .limit(limit)
                .exec(),
        );
    }

    findById(id: string): Observable<Message> {
        return from(this.messageModel.findOne({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
        );
    }

    // from socket
    save(data: CreateMessageDto): Observable<Message> {
        const createMessage: Promise<Message> = this.messageModel.create({
            ...data,
            createdBy: { _id: this.req.user.id },
        });
        return from(createMessage);
    }

    update(id: string, data: UpdateMessageDto): Observable<Message> {
        return from(
            this.messageModel
                .findOneAndUpdate(
                    { _id: id },
                    { ...data, updatedBy: { _id: this.req.user.id } },
                    { new: true },
                )
                .exec(),
        ).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
        );
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
}
