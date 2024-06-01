import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';

import { ServerOptions } from 'socket.io';
import { RedisPropagatorService } from '../redis-propagator/redis-propagator.service';
import { SocketStateService } from './socket-state.service';

interface TokenPayload {
    readonly userId: string;
    readonly username: string;
}

export interface AuthenticatedSocket extends Socket {
    auth: TokenPayload;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
    public constructor(
        private readonly app: INestApplicationContext,
        private readonly socketStateService: SocketStateService,
        private readonly redisPropagatorService: RedisPropagatorService,
    ) {
        super(app);
    }

    create(port: number, options?: ServerOptions): Server {
        const server = super.createIOServer(port, options);
        this.redisPropagatorService.injectSocketServer(server);

        server.use(async (socket: AuthenticatedSocket, next) => {
            console.log('authenticated socket ....');
            const token = socket.handshake.query?.token || socket.handshake.headers?.authorization;

            if (!token) {
                socket.auth = null;

                // not authenticated connection is still valid
                // thus no error
                return next();
            }

            try {
                // fake auth
                socket.auth = {
                    userId: '1234',
                    username: '1234',
                };
                return next();
            } catch (e) {
                return next(e);
            }
        });

        return server;
    }

    bindClientConnect(server: Server, callback: Function) {
        server.on('connection', (socket: AuthenticatedSocket) => {
            console.log('connection ....', socket.auth);
            if (socket.auth) {
                this.socketStateService.addSocket(socket.auth.userId, socket);
                socket.on('disconnect', () => {
                    this.socketStateService.removeSocket(socket);

                    socket.removeAllListeners('disconnect');
                });
            }

            callback(socket);
        });
    }
}