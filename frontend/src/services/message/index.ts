import { IGetMessagesRequest } from '@/types/request'
import http from '../axiosClient'
import { ENDPOINT } from '../endpoint'

class Message {
    getMessages = async (payload: {
        id: string
        params: IGetMessagesRequest
    }): Promise<any> => {
        return http.get(
            ENDPOINT.MESSAGE.GET_MESSAGES.replace(':id', payload.id),
            {
                params: payload.params,
            },
        )
    }

    getFileMessage = async (url: string) => {
        const res = await http.get(url, { responseType: 'blob' })
        return res?.data
    }
}

export const MessageService = new Message()
