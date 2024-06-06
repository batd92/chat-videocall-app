import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import * as path from 'path';
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    constructor(
        private readonly modulePath: string
    ) { }

    createMulterOptions(): MulterModuleOptions {
        return {
            storage: diskStorage({
                destination: this.getDestinationPath(),
                filename: (req, file, cb) => {
                    const uniqueName = `${Date.now()}-${v4()}-${path.extname(file.originalname)}`;
                    const savedPath = `${this.getDestinationPath()}/${uniqueName}`;
                    cb(null, savedPath);
                }
            }),
        };
    }

    private getDestinationPath(): string {
        return `./upload/${this.modulePath}`;
    }
}
