import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'modules/user/user.service';
import { DatabaseModule } from '../../database/database.module';
import { JitsiorgService } from './jitsi.org.service';

@Module({
    imports: [CacheModule.register(), DatabaseModule],
    controllers: [],
    providers: [JitsiorgService, UserService, ConfigService],
})
export class JitsiorgModule { }
