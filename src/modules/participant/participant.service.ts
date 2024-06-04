import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Participant, ParticipantDocument } from '../../database/schemas/participant.schema';

@Injectable()
export class ParticipantService {
    constructor(
        @InjectModel(Participant.name) private readonly participantModel: Model<ParticipantDocument>,
    ) { }

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

    delete(id: string): Observable<Participant> {
        return from(this.participantModel.findOneAndDelete({ _id: id }).exec()).pipe(
            map(participant => {
                if (!participant) {
                    throw new NotFoundException(`Participant with id ${id} not found`);
                }
                return participant;
            }),
            catchError(err => {
                throw new Error(`Error deleting participant: ${err.message}`);
            })
        );
    }
}
