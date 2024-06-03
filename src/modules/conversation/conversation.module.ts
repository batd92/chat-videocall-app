import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { CheckParticipantMiddleware } from 'common/middleware/conversation.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckParticipantMiddleware)
      .forRoutes(
        { path: 'conversations/:id', method: RequestMethod.GET },
        { path: 'conversations/:id', method: RequestMethod.PUT },
        { path: 'conversations/:id', method: RequestMethod.DELETE },
        { path: 'conversations/:id/messages', method: RequestMethod.POST },
      );
  }
}
