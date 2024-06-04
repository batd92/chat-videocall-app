import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { CheckParticipantMiddleware } from 'common/middleware/room.middleware';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from '../../common/file/multer-config.service';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
    imports: [
        DatabaseModule,
        CacheModule.register(
            {
                ttl: 300, // 5m
            }
        ),
        MulterModule.registerAsync({
            useClass: MulterConfigService,
            inject: ['ROOM'],
        })
    ],
    controllers: [RoomController],
    providers: [RoomService],
})
export class RoomModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CheckParticipantMiddleware)
            .forRoutes(
                { path: 'rooms/:id', method: RequestMethod.GET },
                { path: 'rooms/:id', method: RequestMethod.PUT },
                { path: 'rooms/:id', method: RequestMethod.DELETE },
            );
    }
}