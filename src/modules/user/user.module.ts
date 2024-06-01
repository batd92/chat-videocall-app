import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserDataInitializerService } from '../../initializers/user.initializer';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RegisterController } from './register.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [UserService, UserDataInitializerService],
    exports: [UserService],
    controllers: [ProfileController, UserController, RegisterController],
})
export class UserModule { }
