export interface ILoginResponse {
    access_token: string
    refresh_token: string
}

export interface IGetMeResponse {
    _id: string
    email: string
    name: string
    avatarUrl: string
}
