import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type FileDocument = HydratedDocument<File>;

@Schema({ timestamps: true })
export class File {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true })
    mimetype: string;

    @Prop({ default: "" })
    modelType?: string;

    @Prop({ default: "" })
    modelId?: string;

    @Prop({ default: 0 })
    size?: number;

    @Prop({ default: "" })
    file_name?: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
