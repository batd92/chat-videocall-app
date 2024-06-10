import { IsNotEmpty, IsArray, ValidateNested, Min, IsNumber } from 'class-validator';
import { TypeStorageFile, BaseRequest, ActionType } from 'gateway/base-dto/base.request';

export class TextRequest extends BaseRequest {
    @IsNotEmpty()
    readonly content: string;
}
export class RemoveMessageRequest extends BaseRequest {
    @IsNotEmpty()
    readonly messageId: string;
}
export class UploadFileRequest extends BaseRequest {
    @IsArray()
    @ValidateNested()
    files: FileRequest[];
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
export class MakeActionRequest extends BaseRequest {
    @IsNotEmpty()
    action: number;

    @IsNotEmpty()
    type: ActionType;
}