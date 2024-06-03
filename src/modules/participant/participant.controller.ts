import { Body, Controller, Delete, Get, Param, Post, Put, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { Participant } from '../../database/schemas/participant.schema';
import { ParticipantService } from './participant.service';
import { RoleType } from '../../shared/enum/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/pipe/parse-object-id.pipe';
import { CheckOwnerMiddleware } from 'common/middleware/participant.middleware';

@Controller('participants')
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(RoleType.USER, RoleType.ADMIN)
@UseMiddleware(CheckOwnerMiddleware)
export class ParticipantController {
    constructor(private readonly participantService: ParticipantService) { }

    @Post()
    create(@Body() participant: Partial<Participant>): Observable<Participant> {
        return this.participantService.create(participant).pipe(
            catchError(err => {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `Could not create participant: ${err.message}`,
                }, HttpStatus.BAD_REQUEST);
            })
        );
    }

    @Get()
    findAll(): Observable<Participant[]> {
        return this.participantService.findAll().pipe(
            catchError(err => {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `Could not fetch participants: ${err.message}`,
                }, HttpStatus.BAD_REQUEST);
            })
        );
    }

    @Get(':id')
    findOne(@Param('id', ParseObjectIdPipe) id: string): Observable<Participant> {
        return this.participantService.findOne(id).pipe(
            catchError(err => {
                throw new HttpException({
                    status: HttpStatus.NOT_FOUND,
                    error: `Could not find participant: ${err.message}`,
                }, HttpStatus.NOT_FOUND);
            })
        );
    }

    @Put(':id')
    update(@Param('id', ParseObjectIdPipe) id: string, @Body() update: Partial<Participant>): Observable<Participant> {
        return this.participantService.update(id, update).pipe(
            catchError(err => {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `Could not update participant: ${err.message}`,
                }, HttpStatus.BAD_REQUEST);
            })
        );
    }

    @Delete(':id')
    delete(@Param('id', ParseObjectIdPipe) id: string): Observable<Participant> {
        return this.participantService.delete(id).pipe(
            catchError(err => {
                throw new HttpException({
                    status: HttpStatus.NOT_FOUND,
                    error: `Could not delete participant: ${err.message}`,
                }, HttpStatus.NOT_FOUND);
            })
        );
    }
}
function UseMiddleware(CheckParticipantMiddleware: any): (target: typeof ParticipantController) => void | typeof ParticipantController {
    throw new Error('Function not implemented.');
}

