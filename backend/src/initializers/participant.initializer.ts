import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { PARTICIPANT_MODEL, USER_MODEL, ROOM_MODEL } from '../database/constants';
import { Participant } from '../database/schemas/participant.schema';
import { User } from '../database/schemas/user.schema';
import { Room } from '../database/schemas/room.schema';

@Injectable()
export class ParticipantDataInitializerService implements OnModuleInit {
    constructor(
        @Inject(PARTICIPANT_MODEL) private participantModel: Model<Participant>,
        @Inject(USER_MODEL) private userModel: Model<User>,
        @Inject(ROOM_MODEL) private roomModel: Model<Room>
    ) {}

    async onModuleInit(): Promise<void> {
        console.log('(ParticipantDataInitializerService) is initialized...');
        await this.participantModel.deleteMany({});

        const users = await this.userModel.find().exec();
        const rooms = await this.roomModel.find().exec();

        const participants = rooms.flatMap(room => {
            return users.map(user => ({
                roomId: room._id,
                userId: user._id,
                indexMessageRead: 0
            }));
        });

        await this.participantModel.insertMany(participants);
        console.log('Participants created.');
    }
}
