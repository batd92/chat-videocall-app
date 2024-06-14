import { Module } from '@nestjs/common';
import { RoomModule } from '../../modules/room/room.module'; // Import RoomModule
import { JoinRoomGateway } from './join-room.gateway';
import { SocketsStateModule } from '../../core/socket-state/socket-state.module';

@Module({
    imports: [
        RoomModule,
        SocketsStateModule
    ],
    providers: [JoinRoomGateway],
})
export class JoinRoomModule { }
