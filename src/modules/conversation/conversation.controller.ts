import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Res,
    Scope,
    UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { Comment } from '../../database/schemas/comment.schema';
import { Conversation } from '../../database/schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationService } from './conversation.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller({ path: 'conversations', scope: Scope.REQUEST })
export class ConversationController {
    constructor(private conversationService: ConversationService) { }

    @Get(':id')
    getPostById(@Param('id', ParseObjectIdPipe) id: string): Observable<Conversation> {
        return this.conversationService.findById(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HasRoles(RoleType.USER, RoleType.ADMIN)
    updatePost(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() post: UpdateConversationDto,
        @Res() res: Response,
    ): Observable<Response> {
        return this.conversationService.update(id, post).pipe(
            map((post) => {
                return res.status(204).send();
            }),
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HasRoles(RoleType.ADMIN)
    deletePostById(
        @Param('id', ParseObjectIdPipe) id: string,
        @Res() res: Response,
    ): Observable<Response> {
        return this.conversationService.deleteById(id).pipe(
            map((post) => {
                return res.status(204).send();
            }),
        );
    }
}
