export interface ILoginRequest {
    email: string,
    username: string,
    password: string
}

export interface ILogoutRequest {
    userId: string
    deviceId: string
}
