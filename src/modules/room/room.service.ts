import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Participant } from 'database/schemas/participant.schema';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of, switchMap } from 'rxjs';
import { catchError, map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { ROOM_MODEL, PARTICIPANT_MODEL } from '../../database/constants';
import { Room } from '../../database/schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { ChangeRoomNameDto, InviteUserDto } from './dto/update-room.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ParticipantDto, ResRoomDto } from './dto/response.room.dto';

@Injectable({ scope: Scope.REQUEST })
export class RoomService {
    constructor(
        @Inject(ROOM_MODEL) private roomModel: Model<Room>,
        @Inject(REQUEST) private req: AuthenticatedRequest,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject(PARTICIPANT_MODEL) private participantModel: Model<Participant>,
    ) { }

    getRooms(search?: string): Observable<Room[]> {
        const query = search
            ? { 'name': { $regex: search, $options: 'i' } }
            : {};

        return from(this.roomModel.find(query).exec());
    }

    findById(id: string): Observable<ResRoomDto> {
        return from(
            this.roomModel.findById(id)
                .populate('creator', 'username avatar') // Chỉ populate các trường cần thiết của creator
                .populate('participants.user', 'username avatar') // Chỉ populate các trường cần thiết của participants
                .exec()
        ).pipe(
            map((room: Room) => {
                const resRoomDto: ResRoomDto = {
                    _id: room._id,
                    isGroup: room.isGroup,
                    name: room.name,
                    owner: room.owner,
                    fileStorages: room.fileStorages,
                    avatarUrl: room.avatarUrl,
                    totalMessage: room.totalMessage, // Chuyển totalMessage thành string
                    participants: room.participants.map(participant => {
                        const participantDto: ParticipantDto = {
                            userId: participant.userId,
                            indexMessageRead: participant.indexMessageRead.toString(), // Chuyển indexMessageRead thành string
                            isOnline: true,
                            username: participant.user.username, // Lấy username từ user của participant
                            avatar: participant.user.avatar, // Lấy avatar từ user của participant
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

    // TODO
    // Tìm không thấy conversation thì trả về lỗi
    // Nếu conversation đó có !conversation.isGroup thì trả về lỗi vì nó không phải group
    // Nếu userId đó đã tồn tại thì thôi còn không thì tạo các participant dựa vào userId cho conversation
    // cache lại thông tin conversation đó, cập nhật TTL cho cache
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

    delete(id: string): Observable<Room> {
        return from(this.roomModel.findOneAndDelete({ _id: id }).exec()).pipe(
            map(participant => {
                if (!participant) {
                    throw new NotFoundException(`Room with id ${id} not found`);
                }
                return participant;
            }),
            catchError(err => {
                throw new Error(`Error deleting room: ${err.message}`);
            })
        );
    }

    onUpdateRoom(id: string, data: ChangeRoomNameDto): void {
        // TODO

    }
}
