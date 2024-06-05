import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { TextContent, FileContent } from 'database/schemas/message.schema';

export class BaseRequest {
    @IsNotEmpty()
    readonly userId: string;

    @IsNotEmpty()
    readonly roomId: string;

    @IsOptional()
    readonly replyFromId: string;

    @IsNotEmpty()
    readonly type: string;
}
export class MessageRequest extends BaseRequest {
    @IsNotEmpty()
    readonly content: TextContent;
}

export class RemoveMessageRequest extends BaseRequest {
    @IsNotEmpty()
    readonly messageId: string;
}

export class UploadFileRequest extends BaseRequest {
    @IsArray()
    readonly files: FileContent[];
}