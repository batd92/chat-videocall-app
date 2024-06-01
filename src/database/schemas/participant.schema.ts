import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { Conversation } from './conversation.schema';

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ timestamps: true })
export class Participant {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Conversation', required: true })
    conversationId: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ required: true, default: 0 })
    indexMessageRead: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    user?: User;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Conversation' })
    conversation?: Conversation;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);