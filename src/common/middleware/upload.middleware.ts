import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const maxSize = 5 * 1024 * 1024; // 5MB

const upload = multer({
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only images are allowed!'), false);
        }
        cb(null, true);
    }
});

@Injectable()
export class UploadMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        upload.single('file')(req, res, function (err) {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).send('File size exceeds limit!');
                }
                return res.status(400).send(err.message);
            }
            next();
        });
    }
}
