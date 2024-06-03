import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    Query,
    UploadedFile,
    NotFoundException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from '../../database/schemas/conversation.schema';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckParticipantMiddleware } from 'common/middleware/conversation.middleware';


@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(RoleType.USER, RoleType.ADMIN)
@UseMiddleware(CheckParticipantMiddleware)
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) { }

    @Get()
    getConversations(@Query('search') search: string): Observable<Conversation[]> {
        return this.conversationService.getConversations(search);
    }

    @Get(':id')
    getConversationById(@Param('id', ParseObjectIdPipe) id: string): Observable<Conversation> {
        return this.conversationService.findById(id);
    }

    @Post()
    createConversation(
        @Body() createConversationDto: CreateConversationDto,
    ): Observable<Conversation> {
        return this.conversationService.save(createConversationDto);
    }

    @Put(':id')
    updateConversation(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() updateConversationDto: UpdateConversationDto,
    ): Observable<Conversation> {
        return this.conversationService.update(id, updateConversationDto);
    }

    @Delete(':id')
    deleteConversation(@Param('id', ParseObjectIdPipe) id: string): Observable<Conversation> {
        return this.conversationService.deleteById(id);
    }

    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @Param('id') id: string,
        @UploadedFile() file,
    ) {
        if (!file) {
            throw new NotFoundException('File not found');
        }
        // handle file upload logic
    }
}
function UseMiddleware(CheckOwnerMiddleware: any): (target: typeof ConversationController) => void | typeof ConversationController {
    throw new Error('Function not implemented.');
}

