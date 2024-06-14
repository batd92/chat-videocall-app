import { IsNotEmpty, IsArray, ValidateNested, Min, IsNumber, IsOptional } from 'class-validator';
import { TypeStorageFile, BaseRequest, ActionType, BaseCommon } from '../../base-dto/base.request';

/**
 * Text send
 */

 export class TextMessage extends BaseCommon {
    @IsNotEmpty()
    readonly content: string;
}
export class TextRequest extends BaseRequest {
    @IsNotEmpty()
    readonly body: TextMessage;
}

/**
 * Remove message
 */
export class RemoveMessageRequest extends BaseRequest {
    @IsNotEmpty()
    readonly messageId: string;
}

/**
 * Upload
 */
export class UploadFileRequest extends BaseRequest {
    @IsArray()
    @ValidateNested()
    body: FileRequest[];

    @IsOptional()
    readonly replyFromId: string;

    @IsNotEmpty()
    readonly type: string;
}
export class FileRequest {
    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    type: TypeStorageFile;

    @IsNotEmpty()
    file_name: string;

    @IsNumber()
    @Min(5000)
    size: number;
}

/**
 * make action
 */
export class MakeActionRequest extends BaseRequest {
    @IsNotEmpty()
    action: number;

    @IsNotEmpty()
    type: ActionType;
}