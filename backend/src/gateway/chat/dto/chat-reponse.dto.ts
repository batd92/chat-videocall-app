import { BaseResponse, FileResponse } from 'gateway/base-dto/base.response';
export class TextResponse extends BaseResponse {
    readonly content: string;
    readonly type: string;
    readonly replyFrom: TextResponse
}

export class FilesResponse extends BaseResponse {
    readonly content: FileResponse[];
    readonly type: string;
    readonly replyFrom: TextResponse
}