import { IParticipant } from "gateway/chat/interface/base"

export interface ISocket {
    id: string
}

export interface IUserameSocket {
    socketId: string,
    userId: string,
    username: string
}
export interface IUserSocket {
    socketId: string,
    userId: string,
}
export interface IRoomState {
    owner: string,
    ownerVideoCall: string,
    jitsiName: string,
    jitsiToken: string,
    userOnlines: Array<IUserSocket>,
    userJoined: Array<IUserSocket>,
    hostId: string,
    userRejecteds: Array<IUserSocket>,
    inRoom: Array<IUserSocket>
    participants: Array<IParticipant>
}

