import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Response, NextFunction } from 'express';
import { Participant } from '../../database/schemas/participant.schema';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { PARTICIPANT_MODEL } from 'database/constants';

@Injectable()
export class CheckParticipantMiddleware implements NestMiddleware {
    constructor(
        @Inject(PARTICIPANT_MODEL) private participantModel: Model<Participant>
    ) { }

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const roomId = req.params.id;
        const userId = req.user.id;

        const participant = await this.participantModel.findOne({ roomId, userId }).exec();

        if (!participant) {
            throw new UnauthorizedException('You are not a participant of this room.');
        }
        next();
    }
}
