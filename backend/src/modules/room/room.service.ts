import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { ROOM_MODEL, PARTICIPANT_MODEL } from '../../database/constants';
import { Room } from '../../database/schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { ChangeRoomNameDto, InviteUserDto } from './dto/update-room.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ParticipantDto, ResRoomDto } from './dto/response.room.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Message } from '../../database/schemas/message.schema';
import { IParticipant } from 'modules/participant/interface/interface-participant';
import { IRoom } from 'gateway/chat/interface/base';

@Injectable({ scope: Scope.DEFAULT })
export class RoomService {
    constructor(
        @Inject(ROOM_MODEL) private roomModel: Model<Room>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly eventEmitter: EventEmitter2,
    ) {
        console.log('RoomService init ...')
        this.eventEmitter.on('newMessage', (message: Message) => this.onNewMessageInRoom(message));
        this.eventEmitter.on('removeMessage', (messageId: string) => this.onRemoveMessageInRoom(messageId));
    }

    getRooms(search?: string): Observable<{ rooms: Room[], lastRecord: string | null }> {
        const query = search ? { 'name': { $regex: search.replace(/"/g, ''), $options: 'i' } } : {};
        return from(
            this.roomModel.find(query)
                .sort({ 'createdAt': -1 })
                .populate({
                    path: 'participants',
                    select: '_id indexMessageRead -roomId',
                })
                .populate({
                    path: 'owner',
                    select: '_id email username avatar'
                })
                .exec()
                .then(rooms => {
                    const lastRecord = rooms && rooms.length > 0 ? rooms[rooms.length - 1].id.toString() : '';
                    return {
                        rooms: rooms,
                        lastRecord: lastRecord
                    };
                })
        );
    }

    /**
     * Find one
     * @param id 
     * @returns 
     */
    findOne(id: string): Observable<Room> {
        return from(
            this.roomModel.findById(id)
                .populate({
                    path: 'participants',
                    select: '_id indexMessageRead userId -roomId',
                })
                .populate({
                    path: 'owner',
                    select: '_id email username avatar'
                })
                .exec()
        )
    }

    /**
     * Find one
     * @param id 
     * @returns 
     */
    getParticipantsByRoom(id: string): Observable<IRoom> {
        return from(
            this.roomModel.findById(id)
                .populate({
                    path: 'participants',
                    select: '_id userId username'
                })
                .populate({
                    path: 'owner',
                    select: '_id email username avatar'
                })
                .exec()
        ).pipe(
            map((room: Room | null) => {
                if (!room) {
                    throw new Error('Room not found');
                }
                const resRoom: IRoom = {
                    _id: room._id.toString(),
                    isGroup: room.isGroup,
                    name: room.name,
                    owner: room.owner,
                    participants: room.participants?.map((participant: any) => ({
                        _id: participant.userId._id.toString(),
                        username: participant.userId.username,
                        avatar: participant.userId.avatar
                    })) || [],
                };
                return resRoom;
            }),
            catchError(error => {
                return throwError(() => new Error(error.message));
            })
        );
    }

    findById(id: string): Observable<{ room: ResRoomDto }> {
        return from(
            this.roomModel.findById(id)
                .populate({
                    path: 'participants',
                    select: '_id indexMessageRead userId -roomId',
                })
                .populate({
                    path: 'owner',
                    select: '_id email username avatar'
                })
                .exec()
        ).pipe(
            map((room: Room | null) => {
                if (!room) {
                    throw new Error('Room not found');
                }
                const resRoomDto: ResRoomDto = {
                    _id: room._id.toString(),
                    isGroup: room.isGroup,
                    name: room.name,
                    owner: room.owner,
                    avatarUrl: room.avatarUrl,
                    totalMessage: room.totalMessage,
                    participants: room.participants?.map((participant: any) => {
                        const participantDto: ParticipantDto = {
                            userId: participant.userId._id.toString(),
                            indexMessageRead: participant.indexMessageRead.toString(),
                            isOnline: true,
                            username: participant.userId.username,
                            avatarUrl: participant.userId.avatar,
                            name: participant.userId.username,
                        };
                        return participantDto;
                    }) || [],
                };
                return { room: resRoomDto };
            }),
            catchError(error => {
                return throwError(() => new Error(error.message));
            })
        );
    }

    async getById(id: string): Promise<Room> {
        const room = await this.cacheManager.get<Room>(id);
        if (room) return room;

        const roomDB = await this.roomModel.findById(id)
            .populate({
                path: 'participants',
                select: '_id indexMessageRead -roomId',
            })
            .populate({
                path: 'owner',
                select: '_id email username avatar'
            })
            .exec();
        if (!roomDB) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }
        await this.cacheManager.set(roomDB._id.toString(), roomDB);
        return roomDB;
    }

    async save(data: CreateRoomDto, userId: string): Promise<Room> {
        const { userIds } = data;

        const existingRooms = await this.roomModel.find({ participants: { $size: userIds.length, $all: userIds } }).exec();
        if (existingRooms.length > 0) {
            throw new Error(`A room with the same participants already exists.`);
        }

        const isGroup = userIds.length > 2;
        const timeLastMessage = new Date();
        const newRoom = new this.roomModel({
            ...data,
            isGroup,
            timeLastMessage,
            owner: userId,
            avatarUrl: 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp'
        });

        const savedRoom = await newRoom.save();

        const participants: IParticipant[] = userIds.map(userId => ({
            roomId: savedRoom._id,
            userId: userId
        }));

        this.eventEmitter.emit('addUserToRoom', participants);
        await this.cacheManager.set(savedRoom._id.toString(), savedRoom);

        return savedRoom;
    }

    async inviteUserIntoRoom(id: string, data: InviteUserDto): Promise<{ room: Room }> {
        const room = await this.roomModel.findById(id)
            .populate({
                path: 'participants',
                select: '_id indexMessageRead -roomId',
            })
            .populate({
                path: 'owner',
                select: '_id email username avatar'
            })
            .exec();
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }

        if (!room.isGroup) {
            throw new Error(`Room with id ${id} is not a group room`);
        }
        const existingParticipant = room.participants.find(par => data.userIds.includes(par.userId));
        if (existingParticipant) {
            throw new BadRequestException(`user exist in room`);
        }

        const participants: IParticipant[] = data.userIds.map(userId => ({
            roomId: room._id,
            userId: userId
        }));

        this.eventEmitter.emit('addUserToRoom', participants);

        const roomDB = await this.roomModel.findById(id).exec();
        await this.cacheManager.set(roomDB._id.toString(), roomDB);
        return { room: roomDB };
    }

    /**
     * Update room name
     * @param id 
     * @param data 
     * @returns 
     */
    async updateRoom(id: string, data: ChangeRoomNameDto): Promise<{ room: Room }> {
        const room = await this.roomModel.findById(id)
            .populate({
                path: 'participants',
                select: '_id indexMessageRead -roomId',
            })
            .populate({
                path: 'owner',
                select: '_id email username avatar'
            })
            .exec();
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }
        room.name = data.name;
        const updatedRoom = await room.save();

        if (data.userIds) {
            const existingParticipant = room.participants.find(par => data.userIds.includes(par.userId));
            if (existingParticipant) {
                throw new BadRequestException(`user exist in room`);
            }
    
            const participants: IParticipant[] = data.userIds.map(userId => ({
                roomId: room._id,
                userId: userId
            }));
    
            this.eventEmitter.emit('addUserToRoom', participants);
        }

        const roomDB = await this.roomModel.findById(id).exec();
        await this.cacheManager.set(roomDB._id.toString(), roomDB);

        return { room: roomDB };
    }

    /**
     * Update room avatar
     * @param id
     * @param file 
     * @returns 
     */
    async updateAvatar(id: string, file: any): Promise<Room> {
        const room = await this.roomModel.findById(id)
            .populate({
                path: 'participants',
                select: '_id indexMessageRead -roomId',
            })
            .populate({
                path: 'owner',
                select: '_id email username avatar'
            })
            .exec();
        if (!room) {
            throw new NotFoundException(`Room with id ${id} not found`);
        }

        room.avatarUrl = file.path;
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
                this.eventEmitter.emit('removeRoom', id);
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
