import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response, NextFunction } from 'express';
import { Conversation, ConversationDocument } from '../../database/schemas/conversation.schema'; // Import Conversation schema
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';

@Injectable()
export class CheckOwnerMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>
    ) { }

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const conversationId = req.params.id;
        const userId = req.user.id;

        const conversation = await this.conversationModel.findOne({ _id: conversationId, creatorId: userId }).exec();

        if (!conversation) {
            throw new UnauthorizedException('');
        }

        next();
    }
}
