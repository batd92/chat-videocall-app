import { IsNotEmpty} from 'class-validator';
import { BaseRequest, BaseCommon } from '../../base-dto/base.request';

export class Video extends BaseCommon {
    @IsNotEmpty()
    readonly content: string;
}
export class VideoCallRequest extends BaseRequest {
    @IsNotEmpty()
    readonly body: Video;
}