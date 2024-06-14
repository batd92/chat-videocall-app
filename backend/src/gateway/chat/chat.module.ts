import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ChatGateway } from './chat.gateway';
import { RoomModule } from '../../modules/room/room.module'; // Import RoomModule
import { MessageModule } from '../../modules/message/message.module';

@Module({
    imports: [
        RoomModule,
        MessageModule,
        MulterModule.register({ dest: './uploads' })
    ],
    providers: [ChatGateway],
})
export class ChatModule { }
