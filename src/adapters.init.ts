import { INestApplication } from '@nestjs/common';

import { RedisPropagatorService } from './core/redis-propagator/redis-propagator.service';
import { SocketStateAdapter } from './core/socket-state/socket-state.adapter';
import { SocketStateService } from './core/socket-state/socket-state.service';
import { JwtAuthSocketGuardService } from './core/guard/jwt-auth-soket.service';

export const initAdapters = (app: INestApplication): INestApplication => {
    const socketStateService = app.get(SocketStateService);
    const redisPropagatorService = app.get(RedisPropagatorService);
    const wsJwtAuthGuard = app.get(JwtAuthSocketGuardService);

    app.useWebSocketAdapter(new SocketStateAdapter(app, socketStateService, redisPropagatorService, wsJwtAuthGuard));

    return app;
};
