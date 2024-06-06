export enum TypeStorageFile {
    IMAGE = "Image",
    VIDEO = "Video",
    PDF = "Pdf",
    Doc = "Doc",
    Link = "Link"
}

export class BaseResponse {
    readonly userId: string;
    readonly roomId: string;
}

export class FileResponse {
    readonly url: string;
    readonly type: TypeStorageFile;
    readonly file_name: string;
    readonly size: number;
}