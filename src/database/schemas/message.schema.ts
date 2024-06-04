import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TypeMessage, StatusJitsiMeet, TypeStorageMessage } from '../../constants/global.enum'

export class VideoCallContent {
    @Prop({ required: true })
    roomName: string;

    @Prop({ required: true, default: StatusJitsiMeet.INCOMING })
    status: StatusJitsiMeet;

    @Prop({ required: true })
    startTime: number;

    @Prop()
    endTime?: number;
}

export class FileContent {
    @Prop({ required: true })
    url: string;

    @Prop({ required: true, enum: TypeStorageMessage })
    type: TypeStorageMessage;

    @Prop({ required: true })
    file_name: string;

    @Prop({ required: true })
    size: number;
}

export class TextContent {
    @Prop({ required: true, index: true })
    content: string;
}
export class NotifyContent {
    @Prop({ required: true })
    content: string;
}

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
    _id: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Room', required: true })
    roomId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
    replyFromId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, type: MongooseSchema.Types.Mixed })
    content: TextContent | NotifyContent | VideoCallContent | FileContent[];

    @Prop({ required: true, enum: TypeMessage })
    type: TypeMessage;

    @Prop({ required: true, default: 0 })
    deletedAt: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

