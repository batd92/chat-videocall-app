import { Connection } from 'mongoose';
import {
    COMMENT_MODEL,
    DATABASE_CONNECTION,
    POST_MODEL,
    USER_MODEL,
    FILE_MODEL,
    MESSAGE_MODEL,
    CONVERSATION_MODEL,
    PARTICIPANT_MODEL,
    USER_SESSION_MODEL
} from './constants';

import { CommentSchema } from '../database/schemas/comment.schema';
import { PostSchema } from '../database/schemas/post.schema';
import { UserSchema } from '../database/schemas/user.schema';
import { FileSchema } from '../database/schemas/file.schema';
import { MessageSchema } from '../database/schemas/message.schema';
import { ConversationSchema } from '../database/schemas/conversation.schema';
import { ParticipantSchema } from '../database/schemas/participant.schema';
import { UserSessionSchema } from '../database/schemas/user.session.schema';

export const databaseModelsProviders = [
    {
        provide: POST_MODEL,
        useFactory: (connection: Connection) => connection.model('Post', PostSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: COMMENT_MODEL,
        useFactory: (connection: Connection) => connection.model('Comment', CommentSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: USER_MODEL,
        useFactory: (connection: Connection) => connection.model('User', UserSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: FILE_MODEL,
        useFactory: (connection: Connection) => connection.model('File', FileSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: MESSAGE_MODEL,
        useFactory: (connection: Connection) => connection.model('Message', MessageSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: CONVERSATION_MODEL,
        useFactory: (connection: Connection) => connection.model('Conversation', ConversationSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: PARTICIPANT_MODEL,
        useFactory: (connection: Connection) => connection.model('Participant', ParticipantSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: USER_SESSION_MODEL,
        useFactory: (connection: Connection) => connection.model('UserSession', UserSessionSchema),
        inject: [DATABASE_CONNECTION],
    }
];
