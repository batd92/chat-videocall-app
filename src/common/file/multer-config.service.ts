import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';

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
                    cb(null, Date.now() + '-' + v4());
                },
            }),
        };
    }

    private getDestinationPath(): string {
        // Thực hiện logic để xác định đường dẫn lưu trữ file dựa trên ngữ cảnh của module
        // Ví dụ: return './upload/module1' hoặc './upload/module2'
        // Đây chỉ là ví dụ, bạn có thể thay đổi logic theo yêu cầu của bạn
        return `./upload/${this.modulePath}`;
    }
}
