import { IsNotEmpty, IsOptional } from 'class-validator';
import { TextContent, NotifyContent, VideoCallContent, FileContent } from 'database/schemas/message.schema';
export class CreateMessageDto {

    @IsNotEmpty()
    readonly content: TextContent | NotifyContent | VideoCallContent | FileContent[];

    @IsNotEmpty()
    readonly type: string;

    @IsNotEmpty()
    readonly roomId: string;

    @IsNotEmpty()
    readonly userId: string;

    @IsOptional()
    readonly replyFromId: string;
}

export const FILE = 'FILE';
export const TEXT = 'TEXT';
export const LINK = 'LINK';
export const VIDEO = 'VIDEO';