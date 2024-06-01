import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Model, Types } from 'mongoose';
import { EMPTY, from, Observable, of , catchError, toArray, map } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { FILE_MODEL } from '../../database/constants';
import { File } from '../../database/schemas/file.schema';
import { deleteFileOnServer } from '../../common/helper/file-helper';

@Injectable({ scope: Scope.REQUEST })
export class FileService {
    constructor(
        @Inject(FILE_MODEL) private fileModel: Model<File>,
        @Inject(REQUEST) private req: AuthenticatedRequest,
    ) { }

    findById(id: string): Observable<File> {
        return from(this.fileModel.findOne({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`file:$id was not found`)),
        );
    }

    save(data: any): Observable<File> {
        const file: Promise<File> = this.fileModel.create({
            ...data,
            createdBy: { _id: this.req.user.id },
        });
        return from(file);
    }

    deleteById(id: string): Observable<File> {
        return from(this.fileModel.findOneAndDelete({ _id: id }).exec()).pipe(
            mergeMap((p) => (p ? of(p.id) : EMPTY)),
            throwIfEmpty(() => new NotFoundException(`file:$id was not found`)),
        );
    }

    deleteAll(): Observable<any> {
        return from(this.fileModel.deleteMany({}).exec());
    }

    commitFile(paths: string[], model: { modelId: string, modelType: string }): Observable<any> {
        const urlServer = process.env.SERVER_FILE_URL || '';
        paths = paths.map(x => x.replace(/\\/g, "/").replace(`${urlServer}/`, ""));

        return from(this.fileModel.updateMany(
            { path: { $in: paths } },
            { modelId: model.modelId, modelType: model.modelType }
        )).pipe(
            mergeMap((result) => {
                if (result.modifiedCount > 0) {
                    return of(result);
                } else {
                    return EMPTY;
                }
            }),
            throwIfEmpty(() => new NotFoundException(`No files were found to update`))
        );
    }

    cleanFile(): Observable<any> {
        const urlServer = process.env.SERVER_FILE_URL || '';
        const timeFileExpired = parseInt(process.env.TIME_FILE_EXPIRED, 10) || 3600;

        const condition = {
            $and: [
                {
                    $or: [
                        { $and: [{ modelId: { $exists: false } }, { modelType: { $exists: false } }] },
                        { $and: [{ modelId: { $eq: '' } }, { modelType: { $eq: '' } }] },
                    ]
                },
                { createdAt: { $lt: new Date(Date.now() - timeFileExpired * 1000) } },
            ]
        };

        return from(this.fileModel.find(condition).exec()).pipe(
            mergeMap((files) => from(files)),
            mergeMap((file) =>
                from(deleteFileOnServer(file.path, urlServer)).pipe(
                    map(() => file._id),
                    catchError((err) => {
                        console.error(`Error deleting file ${file.path}:`, err);
                        return EMPTY;
                    })
                )
            ),
            toArray(),
            mergeMap((fileIds) =>
                fileIds.length > 0
                    ? from(this.fileModel.deleteMany({ _id: { $in: fileIds } }).exec())
                    : EMPTY
            ),
            catchError((err) => {
                console.error('Error during file deletion:', err);
                return EMPTY;
            })
        );
    }
}
