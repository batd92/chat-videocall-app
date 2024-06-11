import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MulterModule } from '@nestjs/platform-express';
import { CacheModule } from '@nestjs/cache-manager';
import { RoomDataInitializerService } from '../../initializers/room.initializer';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
    imports: [
        DatabaseModule,
        CacheModule.register(),
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const originalName = file.originalname;
                    const extension = extname(originalName);
                    const fileName = `${uniqueSuffix}${extension}`;
                    callback(null, fileName);
                },
            }),
        }),
    ],
    controllers: [RoomController],
    providers: [RoomService, RoomDataInitializerService],
    exports: [RoomService]
})
export class RoomModule { }
