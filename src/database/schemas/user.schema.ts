import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, Connection } from 'mongoose';
import { compare, hash } from 'bcrypt';
import { from, Observable } from 'rxjs';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class User {
    @Prop({ required: true, unique: true, trim: true })
    username: string;

    @Prop({ required: true, unique: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ trim: true })
    firstName?: string;

    @Prop({ trim: true })
    lastName?: string;

    @Prop({ trim: true })
    avatar?: string;

    @Prop({ type: [String], enum: RoleType, default: [] })
    roles?: RoleType[];

    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    comparePassword(password: string): Observable<boolean> {
        return from(compare(password, this.password));
    }

    // Virtual field for full name
    get name(): string {
        return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash password
UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();

    const hashedPassword = await hash(this.password, 12);
    this.password = hashedPassword;

    next();
});

// Virtual for posts
UserSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'createdBy',
});

export const createUserModel = (conn: Connection): Model<UserDocument> =>
    conn.model<UserDocument>('User', UserSchema, 'users');
