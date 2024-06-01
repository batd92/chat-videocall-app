import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PostModule } from './modules/post/post.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LoggerModule } from './logger/logger.module';
import { EventsGateway } from './gateway/room-join/room-join.gateway';
import { CoreModule } from './core/core.module';
@Module({
    imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true }),
        //DatabaseModule,
        CoreModule,
        LoggerModule.forRoot(),
    ],
    providers: [
        EventsGateway
    ]
})
export class AppModule { }