import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../../auth/interface/jwt-payload.interface';
import { JwtStrategy } from '../../auth/strategy/jwt.strategy';
import jwtConfig from '../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UserPrincipal } from '../../auth/interface/user-principal.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthSocketGuardService extends AuthGuard('jwt') implements CanActivate {
    constructor(
        private readonly jwtStrategy: JwtStrategy,
        @Inject(jwtConfig.KEY) private readonly config: ConfigType<typeof jwtConfig>,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('JwtAuthSocketGuardService ...');
        const socket = context.switchToWs().getClient();
        const authToken = socket.handshake.query.token || socket.handshake.headers?.authorization?.split(' ')[1];

        const jwtPayload: JwtPayload = jwt.verify(authToken, this.config.secretKey) as JwtPayload;
        console.log('jwtPayload', jwtPayload);
        const user: UserPrincipal = this.jwtStrategy.validate(jwtPayload);
        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }
        socket.auth = user;
        return Boolean(true);
    }
}
