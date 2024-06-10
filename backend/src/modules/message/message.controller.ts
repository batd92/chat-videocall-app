import {
    Controller,
    Get,
    Query,
    Scope,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageService } from './message.service';
import { QueryMessageDto } from './dto/query-message.dto';
import { Message } from 'database/schemas/message.schema';

@Controller({ path: 'messages', scope: Scope.REQUEST })
export class MessageController {
    constructor(private messageService: MessageService) { }

    @Get('/room/:roomId')
    getAllPosts(
        @Query() query?: QueryMessageDto
    ): Observable<Message[]> {
        return this.messageService.findAll(query);
    }
}
