import http from '../axiosClient'
import { ENDPOINT } from '../endpoint'

class User {
    getFriends = async (): Promise<any> => {
        const res: any = await http.get(ENDPOINT.USER.GET_FRIENDS, {
            params: {
                paginate: JSON.stringify({
                    page: 1,
                    limit: 500,
                }),
            },
        })
        return res
    }
}

export const UserService = new User()
