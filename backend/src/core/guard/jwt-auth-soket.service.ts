import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
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
        const canActivate = await super.canActivate(context);
        if (!canActivate) {
            return false;
        }

        const client = context.switchToWs().getClient();
        const cookies: string[] = client.handshake.headers.cookie.split('; ');
        const authToken = cookies.find(cookie => cookie.startsWith('jwt')).split('=')[1];

        const jwtPayload: JwtPayload = jwt.verify(authToken, this.config.secretKey) as JwtPayload;
        const user: UserPrincipal = this.jwtStrategy.validate(jwtPayload);

        context.switchToWs().getData().user = user;

        return Boolean(user);
    }
}
