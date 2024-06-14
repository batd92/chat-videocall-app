export interface IParticipant {
    readonly _id: string;
    readonly username: string; 
}

export interface IRoom {
    readonly _id: string;
    readonly name: string;
    readonly owner: string;
    readonly isGroup: boolean;
    readonly participants: IParticipant[]
}