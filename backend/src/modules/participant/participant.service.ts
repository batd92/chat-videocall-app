import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Participant, ParticipantDocument } from '../../database/schemas/participant.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PARTICIPANT_MODEL } from '../../database/constants';
import { IParticipant } from './interface/interface-participant';

@Injectable()
export class ParticipantService {
    constructor(
        @Inject(PARTICIPANT_MODEL) private readonly participantModel: Model<ParticipantDocument>,
        private readonly eventEmitter: EventEmitter2
    ) {
        this.eventEmitter.on('removeRoom', (roomId: string) => this.delete(roomId));
        this.eventEmitter.on('addUserToRoom', (participants: IParticipant[]) => this.addUserToRoom(participants));
    }

    create(participant: Partial<Participant>): Observable<Participant> {
        const newParticipant = new this.participantModel(participant);
        return from(newParticipant.save()).pipe(
            catchError(err => {
                throw new Error(`Error creating participant: ${err.message}`);
            })
        );
    }

    findOne(id: string): Observable<Participant> {
        return from(this.participantModel.findById(id).exec()).pipe(
            map(participant => {
                if (!participant) {
                    throw new NotFoundException(`Participant with id ${id} not found`);
                }
                return participant;
            }),
            catchError(err => {
                throw new Error(`Error fetching participant: ${err.message}`);
            })
        );
    }

    delete(id: string): void {
        this.participantModel.findOneAndUpdate(
            { _id: id },
            { $set: { deletedAt: Date.now() } },
            { new: true },
        ).exec();
    }

    addUserToRoom(participants: IParticipant[]): void {
        this.participantModel.insertMany(participants);
    }
}
