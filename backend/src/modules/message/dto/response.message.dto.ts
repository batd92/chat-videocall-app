import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { TextContent, NotifyContent, VideoCallContent, FileContent } from '../../../database/schemas/message.schema';
export class MessageDto {
    readonly content: TextContent | NotifyContent | VideoCallContent | FileContent[];
    readonly _id: string;
    readonly type: string;
    readonly userId: string;
    readonly createdAt: string;
    readonly updatedAt: string;
}


export class ResMessageDto {
    readonly content: TextContent | NotifyContent | VideoCallContent | FileContent[];
    readonly _id: string;
    readonly type: string;
    readonly userId: string;
    readonly createdAt: string;
    readonly updatedAt?: string;
    readonly replyFromId?: MessageDto;
}