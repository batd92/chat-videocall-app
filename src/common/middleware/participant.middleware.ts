import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response, NextFunction } from 'express';
import { Room } from '../../database/schemas/room.schema';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { ROOM_MODEL } from 'database/constants';

@Injectable()
export class CheckOwnerMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(ROOM_MODEL) private roomModel: Model<Room>
    ) { }

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const roomId = req.params.id;
        const userId = req.user.id;

        const room = await this.roomModel.findOne({ _id: roomId, creatorId: userId }).exec();

        if (!room) {
            throw new UnauthorizedException('');
        }

        next();
    }
}
