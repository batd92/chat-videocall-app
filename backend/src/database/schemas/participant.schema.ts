import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { Transform, Type } from 'class-transformer';
import { Room } from './room.schema';

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ timestamps: true })
export class Participant {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Room', required: true })
    @Type(() => Room)
    roomId: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    @Type(() => User)
    userId: string;

    @Prop({ required: true, default: 0 })
    indexMessageRead: number;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

ParticipantSchema.pre(['find', 'findOne'], function () {
    this.populate({
        path: 'userId',
        select: '_id email username avatar',
    }).populate('roomId');
});
