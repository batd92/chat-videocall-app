import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LoggerModule } from './logger/logger.module';
import { WSJwtAuthSocketModule } from './core/guard/jwt-auth-soket.module';
import { CoreModule } from './core/core.module';
import { ChatModule } from './gateway/chat/chat.module';
import { VideoCallModule } from './gateway/video-call/video-call.module';
import { MessageModule } from './modules/message/message.module';
import { ParticipantModule } from './modules/participant/participant.module';
import { RoomModule } from './modules/room/room.module';

@Module({
    imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true }),
        EventEmitterModule.forRoot(),
        UserModule,
        AuthModule,
        DatabaseModule,
        RoomModule,
        MessageModule,
        ParticipantModule,
        CoreModule,
        WSJwtAuthSocketModule,
        LoggerModule.forRoot(),
        VideoCallModule,
        ChatModule
    ],
    providers: [
        
    ]
})
export class AppModule { }
