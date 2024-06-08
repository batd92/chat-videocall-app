import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Participant } from 'database/schemas/participant.schema';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of, switchMap } from 'rxjs';
import { catchError, map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { ROOM_MODEL, PARTICIPANT_MODEL } from '../../database/constants';
import { Room } from '../../database/schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { ChangeRoomNameDto, InviteUserDto } from './dto/update-room.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ParticipantDto, ResRoomDto } from './dto/response.room.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from 'database/schemas/message.schema';

@Injectable({ scope: Scope.REQUEST })
export class RoomService {
    constructor(
        @Inject(ROOM_MODEL) private roomModel: Model<Room>,
        
        @Inject(PARTICIPANT_MODEL) private participantModel: Model<Participant>,

        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.eventEmitter.on('newMessage', (message: Message) => this.onNewMessageInRoom(message));
        this.eventEmitter.on('removeMessage', (messageId: string) => this.onRemoveMessageInRoom(messageId));
    }

    getRooms(search?: string): Observable<Room[]> {
        const query = search
            ? { 'name': { $regex: search, $options: 'i' } }
            : {};

        return from(this.roomModel.find(query).exec());
    }

    /**
     * Find one
     * @param id 
     * @returns 
     */
    findOne(id: string): Observable<Room> {
        return from(
            this.roomModel.findById(id)
                .populate('creator', 'username avatar')
                .populate('participants.user', 'username avatar')
                .exec()
        )
    }

    findById(id: string): Observable<ResRoomDto> {
        return from(
            this.roomModel.findById(id)
                .populate('creator', 'username avatar')
                .populate('participants.user', 'username avatar')
                .exec()
        ).pipe(
            map((room: Room) => {
                const resRoomDto: ResRoomDto = {
                    _id: room._id,
                    isGroup: room.isGroup,
                    name: room.name,
                    owner: room.owner,
                    avatarUrl: room.avatarUrl,
                    totalMessage: room.totalMessage,
                    participants: room.participants.map(participant => {
                        const participantDto: ParticipantDto = {
                            userId: participant.userId,
                            indexMessageRead: participant.indexMessageRead.toString(),
                            isOnline: true,
                            username: participant.user.username,
                            avatar: participant.user.avatar,
                        };
                        return participantDto;
                    }),
                };
                return resRoomDto;
            })
        );
    }

    async getById(id: string): Promise<Room> {
        const room = await this.cacheManager.get<Room>(id);
        if (room) return room;

        const roomDB = await this.roomModel.findById(id).exec();
        if (!roomDB) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }
        await this.cacheManager.set(roomDB._id.toString(), roomDB);
        return roomDB;
    }

    async save(data: CreateRoomDto): Promise<Room> {
        const { userIds } = data;

        const existingRooms = await this.roomModel.find({ participants: { $size: userIds.length, $all: userIds } }).exec();
        if (existingRooms.length > 0) {
            throw new Error(`A room with the same participants already exists.`);
        }

        const isGroup = userIds.length > 2;
        const timeLastMessage = new Date();
        const newRoom = new this.roomModel({ ...data, isGroup, timeLastMessage });

        const savedRoom = await newRoom.save();

        const participants = userIds.map(userId => ({
            roomId: savedRoom._id,
            userId: userId
        }));
        await this.participantModel.insertMany(participants);
        await this.cacheManager.set(savedRoom._id.toString(), savedRoom);

        return savedRoom;
    }

    async inviteUserIntoRoom(id: string, data: InviteUserDto): Promise<Room> {
        const room = await this.roomModel.findById(id).exec();
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }

        if (!room.isGroup) {
            throw new Error(`Room with id ${id} is not a group room`);
        }

        const existingParticipant = room.participants.find(participant => participant.userId === data.userId);
        if (existingParticipant) {
            return room;
        }

        const newParticipant = new this.participantModel({ roomId: id, userId: data.userId });
        await newParticipant.save();

        room.participants.push({ userId: data.userId });
        const updatedRoom = await room.save();

        await this.cacheManager.set(updatedRoom._id.toString(), updatedRoom);
        return updatedRoom;
    }

    /**
     * Update room name
     * @param id 
     * @param data 
     * @returns 
     */
    async updateNameOfRoom(id: string, data: ChangeRoomNameDto): Promise<Room> {
        const room = await this.roomModel.findById(id).exec();
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }
        room.name = data.name;
        const updatedRoom = await room.save();
        await this.cacheManager.set(updatedRoom._id.toString(), updatedRoom);

        return updatedRoom;
    }

    /**
     * Update room avatar
     * @param id
     * @param file 
     * @returns 
     */
    async updateAvatar(id: string, file: any): Promise<Room> {
        const avatarUrl = file.path;
        const room = await this.roomModel.findById(id).exec();
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }
        room.avatarUrl = avatarUrl;
        const savedRoom = await room.save();
        await this.cacheManager.set(savedRoom._id.toString(), savedRoom);
        return savedRoom;
    }

    /**
     * Remove room
     * @param id 
     * @returns 
     */
    delete(id: string): Observable<Room> {
        return from(
            this.roomModel.findOneAndUpdate(
                { _id: id },
                { $set: { deletedAt: Date.now() } },
                { new: true },
            ).exec(),
        ).pipe(
            map(room => {
                if (!room) {
                    throw new NotFoundException(`Room with id ${id} not found`);
                }
                this.eventEmitter.emit('roomDeleted', id);
                return room;
            }),
            catchError(err => {
                throw new Error(`Error deleting room: ${err.message}`);
            }),
        );
    }

    onNewMessageInRoom(message: Message): void {
        // TODO

    }

    onUserInRoom(message: Message): void {
        // TODO

    }

    onRemoveMessageInRoom(messageId: string): void {

    }
}
