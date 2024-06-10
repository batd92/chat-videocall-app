import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtAuthSocketGuardService } from './jwt-auth-soket.service';
import jwtConfig from '../../config/jwt.config';
import { JwtStrategy } from 'auth/strategy/jwt.strategy';

@Module({
    imports: [
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync({
            imports: [ConfigModule.forFeature(jwtConfig)],
            useFactory: (config: ConfigType<typeof jwtConfig>) => {
                return {
                    secret: config.secretKey,
                    signOptions: { expiresIn: config.expiresIn },
                } as JwtModuleOptions;
            },
            inject: [jwtConfig.KEY],
        })
    ],
    providers: [JwtAuthSocketGuardService, JwtStrategy],
    exports: [JwtAuthSocketGuardService],
})
export class WSJwtAuthSocketModule { }