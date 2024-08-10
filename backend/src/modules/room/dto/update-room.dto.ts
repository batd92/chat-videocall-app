import { ArrayMinSize, IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class UpdateRoomDto {

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly content: string;
}

export class InviteUserDto {
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    readonly userIds: string[];
}

export class ChangeRoomNameDto {
    @IsNotEmpty()
    readonly name: string;

    @IsOptional()
    @IsString({ each: true })
    readonly userIds?: string[];
}