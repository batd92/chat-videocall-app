import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service'; // Đảm bảo đường dẫn chính xác
import { DatabaseModule } from '../../database/database.module';
import { JitsiorgService } from './jitsi.org.service';

@Module({
    imports: [CacheModule.register(), DatabaseModule],
    controllers: [],
    providers: [JitsiorgService, UserService, ConfigService],
    exports: [JitsiorgService],
})
export class JitsiorgModule { }
