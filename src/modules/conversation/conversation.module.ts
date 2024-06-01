import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule{}
//  implements NestModule {
//   configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
//     consumer
//       .apply(AuthenticationMiddleware)
//       .forRoutes(
//         { method: RequestMethod.POST, path: '/posts' },
//         { method: RequestMethod.PUT, path: '/posts/:id' },
//         { method: RequestMethod.DELETE, path: '/posts/:id' },
//       );
//   }
// }
