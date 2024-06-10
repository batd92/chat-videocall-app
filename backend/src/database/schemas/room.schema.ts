import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { Participant } from './participant.schema';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true, default: false })
    isGroup: boolean;

    @Prop({ required: true })
    name: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    owner: string;

    @Prop({ required: true, default: 0 })
    totalMessage: number;

    @Prop({ required: true, default: 0 })
    timeLastMessage: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Message' })
    lastMessageId?: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    creator?: Partial<User>;

    @Prop({ required: true })
    avatarUrl: string;

    @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Participant' }] })
    participants?: Partial<Participant>[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.pre(['find', 'findOne'], function() {
    this.populate('participants').populate('owner');
});