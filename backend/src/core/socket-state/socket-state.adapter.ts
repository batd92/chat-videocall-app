import { INestApplicationContext, Inject, UnauthorizedException, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { UserPrincipal } from 'auth/interface/user-principal.interface';
import { Server, Socket } from 'socket.io';

import { ServerOptions } from 'socket.io';
import { RedisPropagatorService } from '../redis-propagator/redis-propagator.service';
import { SocketStateService } from './socket-state.service';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtAuthSocketGuardService } from '../guard/jwt-auth-soket.service';

export interface AuthenticatedSocket extends Socket {
    auth: UserPrincipal;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
    private readonly jwtAuthSocketGuardService: JwtAuthSocketGuardService;

    public constructor(
        private readonly app: INestApplicationContext,
        private readonly socketStateService: SocketStateService,
        private readonly redisPropagatorService: RedisPropagatorService,
    ) {
        super(app);
        this.jwtAuthSocketGuardService = this.app.get(JwtAuthSocketGuardService);
    }

    create(port: number, options?: ServerOptions): Server {
        const server = super.createIOServer(port, options);
        this.redisPropagatorService.injectSocketServer(server);

        server.use(async (socket: AuthenticatedSocket, next) => {
            try {
                console.log('Authenticated socket...');
                console.log('Handshake:', socket.handshake);

                const authToken = socket.handshake.query.token || socket.handshake.headers?.authorization?.split(' ')[1];
                console.log('Token:', authToken);
                if (!authToken) {
                    throw new UnauthorizedException(`Unauthorized exception`);
                }
                await this.jwtAuthSocketGuardService.canActivate(new ExecutionContextHost([socket]));
                next();
            } catch (error) {
                console.log('errror : ', error)
            }

        });

        return server;
    }

    bindClientConnect(server: Server, callback: Function) {
        server.on('connection', (socket: AuthenticatedSocket) => {
            console.log('connection ....');
            if (socket.auth) {
                this.socketStateService.addSocket(socket.auth.id, socket);
                socket.on('disconnect', () => {
                    this.socketStateService.removeSocket(socket);

                    socket.removeAllListeners('disconnect');
                });
            }

            callback(socket);
        });
    }
}