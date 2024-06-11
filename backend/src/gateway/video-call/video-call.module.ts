import { Module } from '@nestjs/common';
import { RoomModule } from '../../modules/room/room.module';
import { JitsiorgModule } from '../jitsi.org/jitsi.org.module';
import { VideoCallGateway } from './video-call.gateway';
import { SocketsStateModule } from '../../core/socket-state/socket-state.module';

@Module({
    imports: [
        RoomModule,
        JitsiorgModule,
        SocketsStateModule
    ],
    providers: [VideoCallGateway],
})
export class VideoCallModule { }
