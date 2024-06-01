import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PostDataInitializerService } from '../../initializers/post.initializer';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { LoggerMiddleware } from '../../common/middleware/logger.middleware';
import { AuthMiddleware } from '../../common/middleware/auth.middleware';
import { UploadMiddleware } from '../../common/middleware/upload.middleware';

@Module({
    imports: [DatabaseModule],
    controllers: [FileController],
    providers: [FileService, PostDataInitializerService],
})
export class FileModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(LoggerMiddleware, AuthMiddleware, UploadMiddleware)
            .forRoutes(
                { method: RequestMethod.POST, path: '/file' },
            );
        consumer
            .apply(LoggerMiddleware)
            .forRoutes({ method: RequestMethod.DELETE, path: '/file/:id' });
    }
}
