import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class FileStorageDataInitializerService implements OnModuleInit {
    constructor(
    ) {}

    async onModuleInit(): Promise<void> {
        console.log('(FileStorageDataInitializerService) is initialized...');
    }
}
