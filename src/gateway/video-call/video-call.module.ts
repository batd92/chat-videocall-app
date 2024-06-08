import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { VideoCallGateway } from './video-call.gateway';
import { MessageService } from '../../modules/message/message.service';
import { RoomService } from '../../modules/room/room.service';
import { JitsiorgModule } from '../jitsi.org/jitsi.org.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        JitsiorgModule,
        MulterModule.register({ dest: './uploads' }),
    ],
    providers: [],
})
export class VideoCallModule { }
