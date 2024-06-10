import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from 'database/schemas/user.schema';
import { Observable } from 'rxjs';

@Controller()
export class ProfileController {

    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: Request): Observable<Partial<User>> {
        const user = req.user as { username: string };
        return this.userService.findByUsername(user.username);
    }
}
