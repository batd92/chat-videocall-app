import { HTMLAttributes } from 'react'

export interface ISvgIcon extends HTMLAttributes<SVGElement> {
    fillColor?: string
    strokeColor?: string
    width?: number
    height?: number
    onClick?: () => void
}

export interface IResponse<K> {
    data: K
    status: boolean
}

export interface IResponsePagination<K> {
    data: K
    status: boolean
    total: number
}

export interface IResponseCursor<K> {
    data: K
    lastRecord: string
}

export interface IParticipant {
    _id: string
    email: string
    name: string
    avatarUrl: string | ''
    indexMessageRead: number
    isOnline: boolean,
    username: string,
    userId: string
}

export interface ITypingUser {
    userId: string
    avatarUrl: string
    senderId: string
    isTyping: boolean
}

export interface IReplyFromMessage {
    _id: string
    roomId: string
    content: any
    type: 'Text' | 'Call' | 'File' | 'Link'
    userId: string
    user?: IParticipant
    createdAt: number
    updatedAt: number
    deletedAt?: number
}

export interface IMessage {
    _id: string
    roomId: string
    content: any
    type: 'Text' | 'Call' | 'File' | 'Link'
    userId: string
    user?: IParticipant
    createdAt: number
    updatedAt: number
    deletedAt?: number
    seen?: boolean
    replyFrom: IReplyFromMessage
}

export interface IRoomDetail {
    id: string
    name: string
    isGroup: boolean
    lastMessageId: string
    lastMessage: IMessage
    timeLastMessage: number
    totalMessage: number
    participants: IParticipant[]
    createdAt: number
    updatedAt: number
    hasOnline: boolean
    avatarUrl?: string
}

export interface IUploadedFile {
    uid: number | string
    url: string
    name: string
    file_name?: string
    status: 'error' | 'done' | 'uploading' | 'removed'
    type: string
    originFileObj?: any
    size?: string
}
