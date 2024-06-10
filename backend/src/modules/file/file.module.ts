import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { LoggerMiddleware } from '../../common/middleware/logger.middleware';
import { AuthMiddleware } from '../../common/middleware/auth.middleware';

@Module({
    imports: [DatabaseModule],
    controllers: [FileController],
    providers: [FileService],
})
export class FileModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(LoggerMiddleware, AuthMiddleware)
            .forRoutes(
                { method: RequestMethod.POST, path: '/file' },
            );
        consumer
            .apply(LoggerMiddleware)
            .forRoutes({ method: RequestMethod.DELETE, path: '/file/:id' });
    }
}
