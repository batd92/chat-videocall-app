import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { JitsiorgRequest } from './dto/jitsiorg.dto';
import { UserService } from '../../modules/user/user.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { pick } from 'common/helper/file-helper';

@Injectable({ scope: Scope.REQUEST })
export class JitsiorgService {
    constructor(
        private userService: UserService,
        private configService: ConfigService
    ) { }

    public async getInfoJitsi(request: JitsiorgRequest): Promise<{ token: string, roomName: string }> {
        const user = await this.userService.findByUserId(request.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = jwt.sign({
            context: {
                user: { ...pick(user, "name", "avatar", "email"), id: user._id.toString() }
            },
            aud: this.configService.get('JWT_APP_ID'),
            iss: this.configService.get('JWT_APP_ID'),
            sub: "example.video.com",
            room: request.roomId
        }, this.configService.get('JWT_SECRET'), {
            header: {
                alg: "HS256",
                typ: "JWT"
            }
        });

        const roomName = request.roomId;
        return { token, roomName };
    }
}
