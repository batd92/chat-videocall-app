import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ParticipantService],
    controllers: [],
})
export class ParticipantModule { }
