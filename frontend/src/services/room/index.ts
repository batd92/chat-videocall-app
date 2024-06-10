import { IResponse } from '@/types/common'
import { IGetRoomsRequest } from '@/types/request/room'
import { IGetRoomResponse } from '@/types/response/room'
import http from '../axiosClient'
import { ENDPOINT } from '../endpoint'

class Room {
    getRooms = async (body: IGetRoomsRequest) => {
        return http.get(ENDPOINT.ROOM.GET_ROOMS, {
            params: body,
        })
    }

    createRoom = async (body: any): Promise<any> => {
        const res: any = await http.post(ENDPOINT.ROOM.CREATE_ROOM, body)

        return res
    }

    invitesToRoom = async (body: any): Promise<any> => {
        const res: any = await http.post(ENDPOINT.ROOM.INVITES_TO_ROOM, body)

        return res
    }

    getRoomDetail = async (id: string): Promise<IResponse<IGetRoomResponse>> => {
        return http.get(ENDPOINT.ROOM.GET_ROOM_DETAIL.replace(':id', id))
    }

    testCall = async (id: string): Promise<IResponse<{ token: string, roomName: string }>> => {
        return http.get(ENDPOINT.ROOM.TEST_CALL, {
            params: {
                id: JSON.stringify(id),
            }
        })
    }


    updateRoomName = async (id: string, body: { name: string }): Promise<any> => {
        const res: any = await http.put(ENDPOINT.ROOM.UPDATE_ROOM_NAME.replace(':id', id), body)
        return res
    }

    updateRoomAvatar = async (id: string, body: { file: string }): Promise<any> => {
        if (!body.file) return
        const formData = new FormData()
        formData.append('file', body.file)

        const res: any = await http.put(ENDPOINT.ROOM.UPDATE_ROOM_AVATAR.replace(':id', id), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return res
    }
}

export const RoomService = new Room()
