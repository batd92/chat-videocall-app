import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { TextContent, FileContent } from 'database/schemas/message.schema';
export class MessageResponse {

    @IsNotEmpty()
    readonly content?: TextContent;

    @IsNotEmpty()
    readonly type: string;

    @IsNotEmpty()
    readonly roomId: string;

    @IsNotEmpty()
    readonly userId: string;

    @IsOptional()
    readonly replyFromId: string;

    @IsArray()
    @IsOptional()
    readonly files?: FileContent[];
}