import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type FileStorageDocument = HydratedDocument<FileStorage>;

@Schema({ timestamps: true })
export class FileStorage {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true })
    mimetype: string;

    @Prop({ default: "" })
    modelType?: string;

    @Prop({ default: "", required: true })
    roomId: string;

    @Prop({ default: 0 })
    size?: number;

    @Prop({ default: "" })
    file_name?: string;
}

export const FileStorageSchema = SchemaFactory.createForClass(FileStorage);
