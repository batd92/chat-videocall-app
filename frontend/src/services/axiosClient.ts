import { notificationMessage } from '@/utils/helpers'
import { deleteCookie, getCookie } from '@/utils/helpers/storage'
import axios from 'axios'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API

const axiosClient = axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
        'content-type': 'application/json',
    },
})

const handleError = (status: number) => {
    const errorHandlers: { [key: number]: () => void } = {
        401: () => {
            deleteCookie('access_token')
            window.location.href = '/login'
        },
        403: () => window.location.href = '/403',
        429: () => notificationMessage({ message: 'Too many requests', type: 'error' })
    }

    if (errorHandlers[status]) {
        errorHandlers[status]()
    } else {
        throw new Error('An unexpected error occurred')
    }
}

axiosClient.interceptors.request.use((config: any) => {
    const token = getCookie('access_token')
    config.headers = {
        ...config.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    return config
})

axiosClient.interceptors.response.use(
    (response: any) => response?.data,
    async (error: any) => {
        const { response } = error
        const { status } = response

        if (error.config?.enableNotificationMessage) {
            notificationMessage({ message: 'Bad request!', type: 'error' })
        }

        handleError(status)
    }
)

export default axiosClient
