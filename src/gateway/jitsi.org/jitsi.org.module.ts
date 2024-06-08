import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { DatabaseModule } from '../../database/database.module';
import { JitsiorgService } from './jitsi.org.service';
import { UserModule } from '../../modules/user/user.module'; // Ensure the correct path

@Module({
    imports: [
        UserModule,
        ConfigModule,
        DatabaseModule,
        CacheModule.register(),
    ],
    controllers: [],
    providers: [JitsiorgService],
    exports: [JitsiorgService],
})
export class JitsiorgModule { }
