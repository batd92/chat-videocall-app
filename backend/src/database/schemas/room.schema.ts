import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Type } from 'class-transformer';
import { Participant } from './participant.schema';

export type RoomDocument = HydratedDocument<Room>;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true
})
export class Room {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true, default: false })
    isGroup: boolean;

    @Prop({ required: true, index: true })
    name: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    owner: string;

    @Prop({ required: true, default: 0 })
    totalMessage: number;

    @Prop({ required: true, default: 0 })
    timeLastMessage: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Message' })
    lastMessageId?: string;

    @Prop({ required: true })
    avatarUrl: string;

    @Type(() => Participant)
    participants: Participant[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.virtual('participants', {
    ref: 'Participant',
    localField: '_id', // at Room._id
    foreignField: 'roomId', // at Participant.roomId
});

RoomSchema.pre(['find', 'findOne'], function () {
    this.populate({
        path: 'owner',
        select: '_id email username avatar',
    });
});