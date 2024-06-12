import { IGetMeResponse } from '..'

export interface IParticipant extends IGetMeResponse {
    indexMessageRead: number
    isOnline: boolean
}

export enum TypeFileStorage {
    IMAGE = "Image",
    VIDEO = "Video",
    PDF = "Pdf",
    DOC = "Doc",
    LINK = "Link"
}

export interface IFileStorage {
    messageId: string
    type: TypeFileStorage
    url: string
    userId: string
    file_name?: string
    size?: string
}

export interface IGetRoomResponse {
    _id: string
    name: string
    isGroup: boolean
    totalMessage: number
    fileStorages: IFileStorage[]
    participants: IParticipant[]
    createdAt: number
    updatedAt: number
    hasOnline: boolean
    avatar?: string
}
