import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { JitsiorgRequest } from './dto/jitsiorg.dto';
import { UserService } from '../../modules/user/user.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { pick } from '../../common/helper/file-helper';

@Injectable({ scope: Scope.DEFAULT })
export class JitsiorgService {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) { }

    public async getInfoJitsi(request: JitsiorgRequest): Promise<{ token: string, roomName: string }> {
        const user = await this.userService.findByUserId(request.userId);
        console.log('user', user);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = jwt.sign({
            context: {
                user: { ...pick(user, "username", "email"), id: user._id.toString() }
            },
            aud: this.configService.get('JWT_APP_ID') || 'nN1YiI6I',
            iss: this.configService.get('JWT_APP_ID') || 'nN1YiI6I',
            room: request.roomId
        }, (this.configService.get('JWT_SECRET') || 'rzxlszyykpbgqcflzxsqcysyhljt'), {
            header: {
                alg: "HS256",
                typ: "JWT"
            }
        });
        const roomName = request.roomId;
        return { token, roomName };
    }
}
