import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response, NextFunction } from 'express';
import { Participant, ParticipantDocument } from '../../database/schemas/participant.schema';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';

@Injectable()
export class CheckParticipantMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(Participant.name) private participantModel: Model<ParticipantDocument>
    ) { }

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const conversationId = req.params.id;
        const userId = req.user.id;

        const participant = await this.participantModel.findOne({ conversationId, userId }).exec();

        if (!participant) {
            throw new UnauthorizedException('You are not a participant of this conversation.');
        }

        next();
    }
}
