export type ApiResponse<T> = {
    success: boolean
    message?: string
    data?: T
}

declare module 'axios' {
    export interface AxiosRequestConfig {
        enableFlashMessage?: boolean
    }
}
