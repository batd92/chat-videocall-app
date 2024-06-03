import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { DatabaseModule } from '../../database/database.module';
import { CheckOwnerMiddleware } from 'common/middleware/participant.middleware';

@Module({
    imports: [DatabaseModule],
    providers: [ParticipantService],
    controllers: [ParticipantController],
})
export class ParticipantModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(CheckOwnerMiddleware)
        .forRoutes(
          { path: 'participants/:id', method: RequestMethod.PUT },
          { path: 'participants/:id', method: RequestMethod.DELETE },
        );
    }
  }
