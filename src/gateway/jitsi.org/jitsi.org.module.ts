import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { JitsiorgService } from './jitsi.org.service';

@Module({
  imports: [CacheModule.register(), DatabaseModule],
  controllers: [],
  providers: [JitsiorgService],
})
export class JitsiorgModule { }
