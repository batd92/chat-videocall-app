import http from '../axiosClient'
import { ENDPOINT } from '../endpoint'

class User {
    getUsers = async (): Promise<any> => {
        const res: any = await http.get(ENDPOINT.USER.GET_USERS, {})
        return res
    }
}

export const UserService = new User()
