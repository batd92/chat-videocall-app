import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { USER_MODEL } from '../database/constants';
import { RoleType } from '../shared/enum/role-type.enum';
import { User } from '../database/schemas/user.schema';

@Injectable()
export class UserDataInitializerService implements OnModuleInit {
    constructor(@Inject(USER_MODEL) private userModel: Model<User>) { }

    public users: User[] = []; // Add this line

    async onModuleInit(): Promise<void> {
        console.log('(UserModule) is initialized...');
        await this.userModel.deleteMany({});
        const users = [1, 2, 3, 4, 5].map(id => {
            return {
                username: 'user' + id,
                password: 'password',
                email: `user${id}@example.com`,
                roles: [RoleType.USER],
                firstName: 'username_',
                lastName: id.toString(),
                avatar: 'https://www.audi.vn/content/dam/nemo/sea/vn/new-homepage/2024/05/Q7_883x883.jpg'
            }
        });
        users.push({
            username: 'user01',
            password: 'password',
            email: 'user01@example.com',
            roles: [RoleType.USER],
            firstName: 'username_',
            lastName: 'Admin',
            avatar: 'https://www.audi.vn/content/dam/nemo/sea/vn/new-homepage/2023/06/883x883-audi-rs-e-tron-gt-highlighted-car-teaser.jpg'
        });

        this.users = await Promise.all(users.map(us => this.userModel.create(us))); // Modify this line
        console.log(this.users);
    }
}
