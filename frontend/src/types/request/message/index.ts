export interface IGetMessagesRequest {
    lastRecord?: string | ''
    limit: number
    isJumpToMessages?: boolean
}
export interface IGetMessagesKeyWordRequest {
    lastRecord?: string | ''
    limit: number
    keyword?: string | null
}
