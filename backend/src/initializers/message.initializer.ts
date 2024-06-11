import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { MESSAGE_MODEL, USER_MODEL, ROOM_MODEL } from '../database/constants';
import { Message, FileContent, NotifyContent, VideoCallContent, Action } from '../database/schemas/message.schema';
import { User } from '../database/schemas/user.schema';
import { Room } from '../database/schemas/room.schema';

@Injectable()
export class MessageDataInitializerService implements OnModuleInit {
    constructor(
        @Inject(MESSAGE_MODEL) private messageModel: Model<Message>,
        @Inject(USER_MODEL) private userModel: Model<User>,
        @Inject(ROOM_MODEL) private roomModel: Model<Room>
    ) { }

    async onModuleInit(): Promise<void> {
        console.log('(MessageDataInitializerService) is initialized...');
        // await this.messageModel.deleteMany({});

        // const users = await this.userModel.find().exec();
        // const rooms = await this.roomModel.find().exec();

        // const messages = rooms.flatMap((room: { _id: any; }) => {
        //     return users.flatMap((user: { _id: any; }) => {
        //         return [
        //             {
        //                 _id: undefined,
        //                 roomId: room._id,
        //                 userId: user._id,
        //                 content: "Hello",
        //                 type: "Text",
        //                 deletedAt: 0,
        //                 actions: [] as Action[]
        //             },
        //             {
        //                 _id: undefined,
        //                 roomId: room._id,
        //                 userId: user._id,
        //                 content: [{
        //                     url: 'https://example.com/file.pdf',
        //                     type: 'PDF',
        //                     file_name: 'file.pdf',
        //                     size: 1024
        //                 } as unknown as FileContent],
        //                 type: "File",
        //                 deletedAt: 0,
        //                 actions: [] as Action[]
        //             },
        //             {
        //                 _id: undefined,
        //                 roomId: room._id,
        //                 userId: user._id,
        //                 content: { content: 'This is a notification' } as NotifyContent,
        //                 type: "Notify",
        //                 deletedAt: 0,
        //                 actions: [] as Action[]
        //             },
        //             {
        //                 _id: undefined,
        //                 roomId: room._id,
        //                 userId: user._id,
        //                 content: {
        //                     roomName: 'Video Call Room 1',
        //                     status: 'INCOMING',
        //                     startTime: Date.now(),
        //                     endTime: Date.now() + 3600000
        //                 } as unknown as VideoCallContent,
        //                 type: "Call",
        //                 deletedAt: 0,
        //                 actions: [] as Action[]
        //             }
        //         ];
        //     });
        // });

        // await this.messageModel.insertMany(messages);
        console.log('Messages created.');
    }
}
