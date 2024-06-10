import {
    Controller,
    Scope,
    Res,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller({ path: 'files', scope: Scope.REQUEST })
export class FileController {
    constructor(private fileService: FileService) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1000 }),
                    new FileTypeValidator({ fileType: 'image/jpeg' }),
                ],
            }),
        ) file,
        @Res() res: Response
    ): Observable<Response> {
        return this.fileService.save(file).pipe(
            map((file) => {
                return res
                    .location('/file/' + file._id)
                    .status(201)
                    .send();
            }),
        );
    }
}
