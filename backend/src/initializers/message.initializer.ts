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
        // const room = await this.roomModel.findById('666ac5f45fd94f8da04fb533').exec();

        // const messages = [
        //     {
        //         _id: undefined,
        //         roomId: room._id,
        //         userId: users[0]._id,
        //         content: [{
        //             url: 'https://h5p.org/sites/default/files/h5p/content/1209180/images/file-6113d5f8845dc.jpeg',
        //             type: 'Image',
        //             file_name: 'file-6113d5f8845dc.jpeg',
        //             size: 1024
        //         } as unknown as FileContent],
        //         type: "File",
        //         deletedAt: 0,
        //         actions: [] as Action[]
        //     },
        //     {
        //         _id: undefined,
        //         roomId: room._id,
        //         userId: users[0]._id,
        //         content: [{
        //             url: 'https://thumbs.dreamstime.com/b/monarch-orange-butterfly-bright-summer-flowers-background-blue-foliage-fairy-garden-macro-artistic-image-monarch-167030287.jpg',
        //             type: 'Image',
        //             file_name: 'image-monarch-167030287.jpg',
        //             size: 1024
        //         } as unknown as FileContent],
        //         type: "File",
        //         deletedAt: 0,
        //         actions: [] as Action[]
        //     },
        //     {
        //         _id: undefined,
        //         roomId: room._id,
        //         userId: users[0]._id,
        //         content: [{
        //             url: 'https://d3phaj0sisr2ct.cloudfront.net/site/images/tools/thumbnails/reviewed/upscale+image.png',
        //             type: 'Doc',
        //             file_name: 'image-monarch-167030287.jpg',
        //             size: 1024
        //         } as unknown as FileContent],
        //         type: "File",
        //         deletedAt: 0,
        //         actions: [] as Action[]
        //     },
        //     {
        //         _id: undefined,
        //         roomId: room._id,
        //         userId: users[0]._id,
        //         content: [{
        //             url: 'https://assets.monica.im/tools-web/_next/static/media/imageGeneratorFeatureIntro1.9f5e7e23.webp',
        //             type: 'Link',
        //             file_name: 'image-monarch-167030287.jpg',
        //             size: 1024
        //         } as unknown as FileContent],
        //         type: "Link",
        //         deletedAt: 0,
        //         actions: [] as Action[]
        //     }
        // ]

        // await this.messageModel.insertMany(messages);
        console.log('Messages created.');
    }
}
