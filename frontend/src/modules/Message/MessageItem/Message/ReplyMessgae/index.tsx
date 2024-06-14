import { IGetMessagesResponse, IFileContent, TypeFileStorage, TypeStorageMessage } from "@/interface/response";
import { IMAGE_TYPE } from "@/utils/constants";
import { getImage } from "@/utils/helpers";
import { FileTextOutlined } from "@ant-design/icons";
import { Image } from "antd";
import clsx from "clsx";
import Linkify from 'react-linkify';

interface IProps {
    message: IGetMessagesResponse;
    isMe: boolean;
}

export const ReplyMessage = ({ message, isMe }: IProps) => {
    const isFileContentArray = Array.isArray(message.content) && message.content.every(item => item?.type === TypeStorageMessage.IMAGE || item?.type === TypeStorageMessage.VIDEO || item?.type === TypeStorageMessage.Doc);

    switch (message.type) {
        case 'Text':
        case 'Link':
            return (
                <div className={clsx('message-content', isMe && 'message-content__me')}>
                    <div className='message'>
                        <Linkify
                            componentDecorator={(decoratedHref, decoratedText, key) => (
                                <a
                                    href={decoratedHref}
                                    key={key}
                                    rel='noopener noreferrer'
                                    target='_blank'
                                >
                                    {decoratedText}
                                </a>
                            )}
                        >
                            {message?.content.toString()}
                        </Linkify>
                    </div>
                </div>
            );

        case 'File':
            if (isFileContentArray) {
                return (
                    <div className={clsx('media-content', isMe && 'media-content__me')}>
                        {(message.content as IFileContent[]).map((item: IFileContent, index: number) => {
                            switch (item?.type) {
                                case TypeStorageMessage.IMAGE:
                                    return (
                                        <Image
                                            key={index}
                                            width={100}
                                            src={getImage(item?.url, IMAGE_TYPE.PHOTO)}
                                            alt={item?.file_name}
                                            preview={false}
                                        />
                                    );

                                case TypeStorageMessage.VIDEO:
                                    return (
                                        <Image
                                            key={index}
                                            width={100}
                                            alt={item?.file_name}
                                            preview={false}
                                            src='/images/video_thumbnail.png'
                                        />
                                    );

                                case TypeStorageMessage.Doc:
                                    return (
                                        <div key={`${item.file_name}_${index}`} className='content__doc'>
                                            <div className='doc__content'>
                                                <div className='doc__content__icon'><FileTextOutlined /></div>
                                                <div className='doc__content__name'>
                                                    <div>{decodeURIComponent(item?.file_name || item.url.substring(item.url.lastIndexOf('/') + 1))}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                default:
                                    return (
                                        <Image
                                            key={index}
                                            width={100}
                                            alt={item?.file_name}
                                            preview={false}
                                            src='/images/video_thumbnail.png'
                                        />
                                    )
                            }
                        })}
                    </div>
                );
            }
    }
};
