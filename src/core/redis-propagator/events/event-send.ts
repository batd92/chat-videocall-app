import { EventEmitterRequest } from './event-emit';

export class RedisSocketEventSendDTO extends EventEmitterRequest {
    public readonly userId: string;
    public readonly socketId: string;
}
