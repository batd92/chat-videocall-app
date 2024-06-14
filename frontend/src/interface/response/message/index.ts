export enum TypeStorageMessage {
    IMAGE = "Image",
    VIDEO = "Video",
    PDF = "Pdf",
    Doc = "Doc",
    Link = "Link"
}
export enum StatusJitsiMeet {
    INCOMING = "Incoming",
    RUNNING = "Running",
    ENDED = "Ended",
}
export interface IVideoCallContent {
    roomName: string;
    status: StatusJitsiMeet;
    startTime: number;
    endTime?: number;
}
export interface IFileContent {
    url: string;
    type: TypeStorageMessage;
    file_name: string;
    size: number;
}
export interface ITextContent {
    content: string;
}
export interface INotifyContent {
    content: string;
}

export enum IActionType {
    Like = 'Like',
    Love = 'Love',
}
export interface  IAction {
    userId: string
    type: IActionType
    createdAt: number
}

export interface IGetMessagesResponse {
    _id: string
    content: ITextContent | INotifyContent | IVideoCallContent | IFileContent[];
    type: string
    roomId: string
    createdAt: string
    updatedAt: string
    deletedAt?: string
    userId: IUserMessage
    actions: IAction,
    messageRepy?: IGetMessagesResponse;
    seen: any;

}
export interface IUserMessage {
    id: string
    username: string
    avatar: string,
    email: string
}
