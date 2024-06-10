import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OS, StatusAppUser } from '../../constants/global.enum';

export type UserSessionDocument = UserSession & Document;

@Schema({ timestamps: true })
export class UserSession {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    deviceId: string;

    @Prop({ required: true })
    firebaseToken: string;

    @Prop({ required: true, default: OS.WEB, enum: OS })
    os: OS;

    @Prop()
    socketId?: string;

    @Prop({ required: true, default: StatusAppUser.OFFLINE, enum: StatusAppUser })
    status: StatusAppUser;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
