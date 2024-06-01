import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from './user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {

    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
    title: string;

    @Prop({ required: true, trim: true })
    content: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    createdBy?: User;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    updatedBy?: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);