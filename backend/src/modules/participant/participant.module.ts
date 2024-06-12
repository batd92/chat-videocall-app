import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { DatabaseModule } from '../../database/database.module';
import { CheckParticipantMiddleware } from '../../common/middleware/room.middleware';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [DatabaseModule, EventEmitterModule.forRoot()],
    providers: [ParticipantService],
    controllers: [],
    exports: [ParticipantService],
})
export class ParticipantModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(CheckParticipantMiddleware).forRoutes(
            { path: '/your_route_path', method: RequestMethod.ALL },
        );
    }
}
