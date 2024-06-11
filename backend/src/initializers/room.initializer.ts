import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ROOM_MODEL, USER_MODEL } from '../database/constants';
import { Room } from '../database/schemas/room.schema';
import { User } from 'database/schemas/user.schema';

@Injectable()
export class RoomDataInitializerService implements OnModuleInit {
    constructor(
        @Inject(ROOM_MODEL) private roomModel: Model<Room>,
        @Inject(USER_MODEL) private userModel: Model<User>
    ) { }

    async onModuleInit(): Promise<void> {
        console.log('(RoomDataInitializerService) is initialized...');
        
        // await this.roomModel.deleteMany({});
        // const users = await this.userModel.find().exec();

        // if (users.length === 0) {
        //     console.log('No users found. Rooms cannot be created.');
        //     return;
        // }

        // const randomUser1 = users[Math.floor(Math.random() * users.length)];

        // const room1 = {
        //     isGroup: true,
        //     name: 'Group Room 1',
        //     owner: randomUser1._id,
        //     totalMessage: 0,
        //     timeLastMessage: 0,
        //     avatarUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg',
        //     participants: [randomUser1._id, users[0]._id]
        // };

        // const randomUser2 = users[Math.floor(Math.random() * users.length)];
        // const room2 = {
        //     isGroup: true,
        //     name: 'Private Room 1',
        //     owner: randomUser2._id,
        //     totalMessage: 0,
        //     timeLastMessage: 0,
        //     avatarUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg',
        //     participants: [randomUser2._id, users[0]._id]
        // };

        // await Promise.all([
        //     this.roomModel.create(room1),
        //     this.roomModel.create(room2)
        // ]).then(data => console.log('Created rooms:', data));
    }
}
