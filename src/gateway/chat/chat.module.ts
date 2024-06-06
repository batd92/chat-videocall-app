import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from '../../common/file/multer-config.service';
import { ChatGateway } from './chat.gateway';
import { MessageService } from '../../modules/message/message.service';
import { RoomService } from '../../modules/room/room.service';

@Module({
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigService,
            inject: ['CHAT'],
        })
    ],
    providers: [ChatGateway, MessageService, RoomService],
})
export class ChatModule { }
