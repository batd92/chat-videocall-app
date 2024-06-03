import {
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Query,
    Scope,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Observable } from 'rxjs';
import { Message } from '../../database/schemas/message.schema';
import { MessageService } from './message.service';

@Controller({ path: 'messages', scope: Scope.REQUEST })
export class MessageController {
    constructor(private messageService: MessageService) { }

    @Get('/api/conversation/:conversationId/messages')
    getAllPosts(
        @Query('q') keyword?: string,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
        @Query('next_cursor', ParseObjectIdPipe) next_cursor?: string
    ): Observable<Message[]> {
        return this.messageService.findAll(keyword, skip, limit, next_cursor);
    }
}
