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
    avatar: string | null
    indexMessageRead: number
    isOnline: boolean
}

export interface ITypingUser extends IParticipant {
    isTyping: boolean
}

export interface IReplyFromMessage {
    _id: string
    conversationId: string
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
    conversationId: string
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
    _id: string
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
    avatar?: string
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
