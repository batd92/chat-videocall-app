import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LoggerModule } from './logger/logger.module';
import { WSJwtAuthSocketModule } from './core/guard/jwt-auth-soket.module';
import { CoreModule } from './core/core.module';
import { MessageModule } from './modules/message/message.module';
import { ParticipantModule } from './modules/participant/participant.module';
import { RoomModule } from './modules/room/room.module';
import { ChatModule } from './gateway/chat/chat.module';
import { VideoCallModule } from './gateway/video-call/video-call.module';
import { JitsiorgModule } from 'gateway/jitsi.org/jitsi.org.module';

@Module({
    imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true }),
        EventEmitterModule.forRoot(),
        DatabaseModule,
        CoreModule, 
        ChatModule,
        VideoCallModule,
        JitsiorgModule,
        UserModule,
        AuthModule,
        RoomModule,
        MessageModule,
        ParticipantModule,
        WSJwtAuthSocketModule,
   
        LoggerModule.forRoot(),
    ],
    providers: [
        
    ]
})
export class AppModule { }
