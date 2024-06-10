import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { MESSAGE_MODEL, USER_MODEL, ROOM_MODEL } from '../database/constants';
import { Message, TypeMessage, TextContent } from '../database/schemas/message.schema';
import { User } from '../database/schemas/user.schema';
import { Room } from '../database/schemas/room.schema';

@Injectable()
export class MessageDataInitializerService implements OnModuleInit {
    constructor(
        @Inject(MESSAGE_MODEL) private messageModel: Model<Message>,
        @Inject(USER_MODEL) private userModel: Model<User>,
        @Inject(ROOM_MODEL) private roomModel: Model<Room>
    ) {}

    async onModuleInit(): Promise<void> {
        console.log('(MessageDataInitializerService) is initialized...');
        await this.messageModel.deleteMany({});

        const users = await this.userModel.find().exec();
        const rooms = await this.roomModel.find().exec();

        const messages = rooms.map(room => {
            return users.map(user => ({
                roomId: room._id,
                userId: user._id,
                content: new TextContent({ content: 'Hello world' }),
                type: TypeMessage.TEXT,
                deletedAt: 0,
                actions: []
            }));
        }).flat();

        await this.messageModel.insertMany(messages);
        console.log('Messages created.');
    }
}
