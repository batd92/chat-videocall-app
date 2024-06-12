import { IResponse } from '@/interface/common'
import { ILoginRequest, ILogoutRequest } from '@/interface/request'
import { IGetMeResponse, ILoginResponse } from '@/interface/response'
import { setCookie } from '@/utils/helpers/storage'
import http from '../axiosClient'
import { ENDPOINT } from '../endpoint'

class Auth {
    login = async (body: ILoginRequest): Promise<IResponse<ILoginResponse>> => {
        const res: any = await http.post(ENDPOINT.AUTH.LOGIN, body);
        const access_token = res?.data?.access_token

        if (access_token) {
            setCookie('access_token', access_token, { expires: 365 })
        }

        return res
    }

    getMe = async (): Promise<IResponse<IGetMeResponse>> => {
        const res: any = await http.get(ENDPOINT.AUTH.GET_ME)
        return res
    }

    logout = (body: ILogoutRequest) => {
        return http.post(ENDPOINT.AUTH.LOGOUT, body);
    }
}

export const AuthService = new Auth()
