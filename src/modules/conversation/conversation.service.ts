import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { CONVERSATION_MODEL } from '../../database/constants';
import { Conversation } from '../../database/schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable({ scope: Scope.REQUEST })
export class ConversationService {
    constructor(
        @Inject(CONVERSATION_MODEL) private conversationModel: Model<Conversation>,
        @Inject(REQUEST) private req: AuthenticatedRequest,
    ) { }

    getConversations(): Observable<Conversation[]> {
        return from(this.conversationModel.find({}).exec());
    }

    findById(id: string): Observable<Conversation> {
        return from(this.conversationModel.findOne({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`Conversation:$id was not found`)),
        );
    }

    save(data: CreateConversationDto): Observable<Conversation> {
        //console.log('req.user:'+JSON.stringify(this.req.user));
        const createPost: Promise<Conversation> = this.conversationModel.create({
            ...data,
            createdBy: { _id: this.req.user.id },
        });
        return from(createPost);
    }

    update(id: string, data: UpdateConversationDto): Observable<Conversation> {
        return from(
            this.conversationModel
                .findOneAndUpdate(
                    { _id: id },
                    { ...data, updatedBy: { _id: this.req.user.id } },
                    { new: true },
                )
                .exec(),
        ).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`Conversation:$id was not found`)),
        );
    }

    deleteById(id: string): Observable<Conversation> {
        return from(this.conversationModel.findOneAndDelete({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p.id) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`Conversation:$id was not found`)),
        );
    }

    deleteAll(): Observable<any> {
        return from(this.conversationModel.deleteMany({}).exec());
    }
}
