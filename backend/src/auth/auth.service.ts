import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { from, Observable, of, throwError } from 'rxjs';
import { mergeMap, map, throwIfEmpty } from 'rxjs/operators';
import { UserService } from '../modules/user/user.service';
import { AccessToken } from './interface/access-token.interface';
import { JwtPayload } from './interface/jwt-payload.interface';
import { UserPrincipal } from './interface/user-principal.interface';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    validateUser(username: string, pass: string): Observable<UserPrincipal> {
        return this.userService.findByUsername(username).pipe(
            mergeMap((p) => (p ? of(p) : throwError(new UnauthorizedException(`username or password is not matched`)))),
            mergeMap((user) => this.comparePassword(pass, user.password).pipe(
                map(isMatched => {
                    if (isMatched) {
                        const { _id, username, email, roles } = user;
                        return { id: _id, username, email, roles } as UserPrincipal;
                    } else {
                        throw new UnauthorizedException('username or password is not matched');
                    }
                })
            ))
        );
    }

    login(user: UserPrincipal): Observable<AccessToken> {
        const payload: JwtPayload = {
            upn: user.username,
            sub: user.id,
            email: user.email,
            roles: user.roles,
        };
        return from(this.jwtService.signAsync(payload)).pipe(
            map((access_token) => ({ access_token })),
        );
    }

    private comparePassword(enteredPassword: string, hashedPassword: string): Observable<boolean> {
        return from(compare(enteredPassword, hashedPassword));
    }
}
