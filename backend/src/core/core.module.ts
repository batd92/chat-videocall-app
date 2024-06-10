import { Global, Module } from '@nestjs/common';

import { RedisPropagatorModule } from './redis-propagator/redis-propagator.module';
import { RedisModule } from './redis/redis.module';
import { SocketsStateModule } from './socket-state/socket-state.module';

@Global()
@Module({
  imports: [RedisModule, RedisPropagatorModule, SocketsStateModule],
  exports: [RedisModule, RedisPropagatorModule, SocketsStateModule],
})
export class CoreModule {}
