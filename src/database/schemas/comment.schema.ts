import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { Post } from './post.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {

    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Post', required: false })
    post?: Partial<Post>;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    createdBy?: Partial<User>;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    updatedBy?: Partial<User>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
