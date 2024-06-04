import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { Participant } from './participant.schema';
import { TypeFileStorage } from 'constants/global.enum';

export type RoomDocument = HydratedDocument<Room>;

class FileStorage {
    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    type: TypeFileStorage;

    @Prop({ type: SchemaTypes.ObjectId, required: true })
    messageId: string;

    @Prop({ type: SchemaTypes.ObjectId, required: true })
    userId: string;

    @Prop()
    fileName?: string;

    @Prop()
    size?: number;
}

@Schema({ timestamps: true })
export class Room {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true, default: false })
    isGroup: boolean;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    owner: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    creatorId: string;

    @Prop({ type: [FileStorage], default: [] })
    fileStorages: FileStorage[];

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
