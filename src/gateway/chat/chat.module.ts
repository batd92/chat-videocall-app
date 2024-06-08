import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ChatGateway } from './chat.gateway';
import { MessageService } from '../../modules/message/message.service';
import { RoomService } from '../../modules/room/room.service';
import { RoomModule } from '../../modules/room/room.module';
import { MessageModule } from '../../modules/message/message.module';

@Module({
    imports: [
        RoomModule,
        MessageModule,
        MulterModule.register({ dest: './uploads' })

    ],
    providers: [],
})
export class ChatModule { }
