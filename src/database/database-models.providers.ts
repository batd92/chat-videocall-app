import { Connection } from 'mongoose';
import {
    DATABASE_CONNECTION,
    USER_MODEL,
    FILE_MODEL,
    MESSAGE_MODEL,
    ROOM_MODEL,
    PARTICIPANT_MODEL,
    USER_SESSION_MODEL
} from './constants';

import { UserSchema } from '../database/schemas/user.schema';
import { FileStorageSchema } from './schemas/file-storage.schema';
import { MessageSchema } from '../database/schemas/message.schema';
import { RoomSchema } from './schemas/room.schema';
import { ParticipantSchema } from '../database/schemas/participant.schema';
import { UserSessionSchema } from '../database/schemas/user.session.schema';

export const databaseModelsProviders = [
    {
        provide: USER_MODEL,
        useFactory: (connection: Connection) => connection.model('User', UserSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: FILE_MODEL,
        useFactory: (connection: Connection) => connection.model('FileStorage', FileStorageSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: MESSAGE_MODEL,
        useFactory: (connection: Connection) => connection.model('Message', MessageSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: ROOM_MODEL,
        useFactory: (connection: Connection) => connection.model('Room', RoomSchema),
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
