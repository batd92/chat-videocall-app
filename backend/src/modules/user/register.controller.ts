import { Body, ConflictException, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RegisterDto } from './dto/register.dto';
import { UserService } from './user.service';

@Controller('register')
export class RegisterController {
    constructor(private userService: UserService) { }

    @Post()
    register(
        @Body() registerDto: RegisterDto,
        @Res() res: Response
    ): Observable<Response> {
        const { username, email } = registerDto;

        return this.userService.existsByUsername(username).pipe(
            mergeMap((usernameExists) => {
                if (usernameExists) {
                    throw new ConflictException(`Username '${username}' is already taken.`);
                }
                return this.userService.existsByEmail(email);
            }),
            mergeMap((emailExists) => {
                if (emailExists) {
                    throw new ConflictException(`Email '${email}' is already registered.`);
                }
                return this.userService.register(registerDto);
            }),
            map((user) => {
                return res.location('/users/' + user.username).status(201).send();
            }),
            catchError((error) => {
                return throwError(error);
            })
        );
    }
}
