import { IsNotEmpty, IsOptional, IsArray, ValidateNested, Min, IsNumber } from 'class-validator';

export enum TypeStorageFile {
    IMAGE = "Image",
    VIDEO = "Video",
    PDF = "Pdf",
    Doc = "Doc",
    Link = "Link"
}

export enum ActionType {
    Like = 'Like',
    Love = 'Love',
}

export class TextContent {
    @IsNotEmpty()
    content: string;
}

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