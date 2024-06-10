import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { LoggerMiddleware } from '../../common/middleware/logger.middleware';
import { AuthMiddleware } from '../../common/middleware/auth.middleware';
import { EventEmitterModule } from '@nestjs/event-emitter'; 
import { MessageDataInitializerService } from 'initializers/message.initializer';

@Module({
    imports: [DatabaseModule, EventEmitterModule.forRoot()],
    controllers: [MessageController],
    providers: [MessageService, MessageDataInitializerService],
    exports: [MessageService],
})
export class MessageModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(LoggerMiddleware, AuthMiddleware)
            .forRoutes(
                { method: RequestMethod.POST, path: '/message' },
                { method: RequestMethod.PUT, path: '/message/:id' },
                { method: RequestMethod.DELETE, path: '/message/:id' },
            );
    }
}
