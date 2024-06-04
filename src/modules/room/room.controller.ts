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
    FileTypeValidator
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
    getRooms(@Query('search') search: string): Observable<Room[]> {
        return this.roomService.getRooms(search);
    }

    @Get(':id')
    getRoomById(@Param('id', ParseObjectIdPipe) id: string): Observable<ResRoomDto> {
        return this.roomService.findById(id);
    }

    @Post()
    async createRoom(
        @Body() createRoomDto: CreateRoomDto,
    ): Promise<Room> {
        return this.roomService.save(createRoomDto);
    }

    @Put(':id')
    inviteUserIntoRoom(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() inviteUserDto: InviteUserDto,
    ): Promise<Room> {
        return this.roomService.inviteUserIntoRoom(id, inviteUserDto);
    }

    @Put(':id')
    updateNameOfRoom(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() changeRoomNameDto: ChangeRoomNameDto,
    ): Promise<Room> {
        return this.roomService.updateNameOfRoom(id, changeRoomNameDto);
    }

    @Delete(':id')
    deleteRoom(@Param('id', ParseObjectIdPipe) id: string): Observable<Room> {
        return this.roomService.delete(id);
    }

    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @Param('id', ParseObjectIdPipe) id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1000 }),
                    new FileTypeValidator({ fileType: 'image/jpeg' }),
                ],
            }),
        ) file?: Express.Multer.File,
    ) {
        return this.roomService.updateAvatar(id, file);
    }
}