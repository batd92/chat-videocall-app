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

axiosClient.interceptors.request.use(async (config: any) => {
    const customHeaders = {
        Authorization: '',
    }

    const token = getCookie('access_token') ? getCookie('access_token') : ''

    if (token) {
        customHeaders.Authorization = `Bearer ${token}`
    }

    return {
        ...config,
        headers: {
            ...customHeaders, // auto attach token
            ...config.headers, // but you can override for some requests
        },
    }
})

axiosClient.interceptors.response.use(
    (response: any) => {
        return response?.data
    },

    async (error: any) => {
        const {
            config,
            response: { status },
        } = error

        if (config?.enableNotificationMessage) {
            notificationMessage({
                message: 'Bad request!',
                type: 'error',
            })
        }

        if (status === 401) {
            deleteCookie('access_token')
            window.location.href = '/login'
        } else if (error.response.status === 403) {
            window.location.href = '/403'
        } else if (error.response.status === 429) {
            notificationMessage({
                message: 'Too many request',
                type: 'error',
            })
        } else {
            throw {
                ...error.response.data,
                status: error.response.status,
            }
        }
    },
)

export default axiosClient
