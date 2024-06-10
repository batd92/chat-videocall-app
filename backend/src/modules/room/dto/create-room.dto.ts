import { ArrayMinSize, IsArray, IsString, IsNotEmpty } from 'class-validator';
export class CreateRoomDto {
    @IsNotEmpty()
    readonly name: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    readonly userIds: string[];
}
