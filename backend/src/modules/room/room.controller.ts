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
    NotFoundException,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Req
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { InviteUserDto, ChangeRoomNameDto } from './dto/update-room.dto';
import { Room } from '../../database/schemas/room.schema';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ResRoomDto } from './dto/response.room.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(RoleType.USER, RoleType.ADMIN)
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get()
    getRooms(@Query('keyword') search: string): Observable<{ rooms: Room[], lastRecord: string | null }> {
        return this.roomService.getRooms(search);
    }

    @Get(':id')
    getRoomById(@Param('id', ParseObjectIdPipe) id: string): Observable<{ room: ResRoomDto }> {
        return this.roomService.findById(id);
    }

    @Post()
    async createRoom(
        @Body() createRoomDto: CreateRoomDto,
        @Req() req: Request
    ): Promise<Room> {
        const user = req['user'];
        const userId = user.id; 
        return this.roomService.save(createRoomDto, userId);
    }

    @Put(':id/invites')
    inviteUserIntoRoom(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() inviteUserDto: InviteUserDto,
    ): Promise<{room: Room}> {
        return this.roomService.inviteUserIntoRoom(id, inviteUserDto);
    }

    @Put(':id/name')
    updateNameOfRoom(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() changeRoomNameDto: ChangeRoomNameDto,
    ): Promise<{ room: Room}> {
        return this.roomService.updateNameOfRoom(id, changeRoomNameDto);
    }

    @Delete(':id')
    deleteRoom(@Param('id', ParseObjectIdPipe) id: string): Observable<Room> {
        return this.roomService.delete(id);
    }

    @Put(':id/avatar')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @Param('id', ParseObjectIdPipe) id: string,
        @UploadedFile(
            // new ParseFilePipe({
            //     validators: [
            //         new MaxFileSizeValidator({ maxSize: 9000 }),
            //         new FileTypeValidator({ fileType: 'image/jpeg' }),
            //     ],
            // }),
        ) file?: Express.Multer.File,
    ) {
        return this.roomService.updateAvatar(id, file);
    }
}