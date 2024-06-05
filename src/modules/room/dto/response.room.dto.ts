import { TypeFileStorage } from "constants/global.enum";

export class ResRoomDto {
    readonly _id: string;
    readonly isGroup: boolean;
    readonly name: string;
    readonly owner: string;
    readonly avatarUrl: string;
    readonly participants: ParticipantDto[];
    readonly totalMessage: number;
}

export class ParticipantDto {
    readonly userId: string;
    readonly indexMessageRead: string;
    readonly isOnline: boolean;
    readonly username: string; // username của user
    readonly avatar: string; // avatar cảu user
}

class FileStorage {
    messageId: string
    type: TypeFileStorage
    url: string
    userId: string
    file_name?: string
    size?: number
}
