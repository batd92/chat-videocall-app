import {
    Controller,
    Scope,
    Res,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
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
        @UploadedFile() file,
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
