import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { PARTICIPANT_MODEL, USER_MODEL, ROOM_MODEL } from '../database/constants';
import { Participant } from '../database/schemas/participant.schema';
import { User } from '../database/schemas/user.schema';
import { Room } from '../database/schemas/room.schema';
@Injectable()
export class RoomDataInitializerService implements OnModuleInit {
    constructor(
        @Inject(ROOM_MODEL) private roomModel: Model<Room>,
        @Inject(USER_MODEL) private userModel: Model<User>,
        @Inject(PARTICIPANT_MODEL) private participantModel: Model<Participant>
    ) { }

    async onModuleInit(): Promise<void> {
        // console.log('(RoomDataInitializerService) is initialized...');
        
        // await this.roomModel.deleteMany({});
        // await this.participantModel.deleteMany({});
        
        // const users = await this.userModel.find().exec();
    
        // if (users.length === 0) {
        //     console.log('No users found. Rooms cannot be created.');
        //     return;
        // }
    
        // const randomUser1 = users[Math.floor(Math.random() * users.length)];
    
        // const room1 = await this.roomModel.create({
        //     isGroup: true,
        //     name: 'Group Room 1',
        //     owner: randomUser1._id,
        //     totalMessage: 0,
        //     timeLastMessage: 0,
        //     avatarUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg',
        // });
    
        // // Create Participant for owner
        // await this.participantModel.create({
        //     user: randomUser1._id,
        //     room: room1._id,
        //     indexMessageRead: 0,
        //     userId: randomUser1._id, // Thêm userId vào đây
        //     roomId: room1._id // Thêm roomId vào đây
        // });
    
        // const randomUser2 = users[Math.floor(Math.random() * users.length)];
        // const room2 = await this.roomModel.create({
        //     isGroup: true,
        //     name: 'Private Room 1',
        //     owner: randomUser2._id,
        //     totalMessage: 0,
        //     timeLastMessage: 0,
        //     avatarUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg',
        // });
    
        // // Create Participant for owner
        // await this.participantModel.create({
        //     indexMessageRead: 0,
        //     userId: randomUser2._id, // Thêm userId vào đây
        //     roomId: room2._id // Thêm roomId vào đây
        // });
    
        // console.log('Created rooms:', room1, room2);
    }
}
