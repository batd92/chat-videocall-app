import { CallEndedIcon, CallIcon, SeenIcon, SentIcon } from "@/components/icons";
import { IGetMessagesResponse, StatusJitsiMeet, TypeFileStorage, IFileContent, ITextContent, INotifyContent, IVideoCallContent, TypeStorageMessage } from "@/interface/response";
import { IMAGE_TYPE } from "@/utils/constants";
import { formatDateTime, getImage } from "@/utils/helpers";
import { FileTextOutlined } from "@ant-design/icons";
import { Image } from "antd";
import clsx from "clsx";
import Linkify from 'react-linkify';

interface IProps {
    message: IGetMessagesResponse;
    isMe: boolean;
    isLastMsg: boolean;
}

export const MessageText = ({ message, isLastMsg, isMe }: IProps) => {
    switch (message?.type) {
        case 'Text':
        case 'Link':
            // Ensure message.content is of type ITextContent
            const textContent = message.content as ITextContent;
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
                            {textContent.toString()}
                        </Linkify>
                    </div>
                    <div className='time'>
                        {isMe && isLastMsg && (message.seen ? <SeenIcon /> : <SentIcon />)}
                        <p>{formatDateTime(message?.createdAt)}</p>
                    </div>
                </div>
            );

        case 'Call':
            // Ensure message.content is of type IVideoCallContent
            const callContent = message.content as IVideoCallContent;
            const callStatus = callContent?.status;
            switch (callStatus) {
                case StatusJitsiMeet.RUNNING:
                    return (
                        <div className='calling-content'>
                            <div className='left'>
                                <CallIcon />
                            </div>
                            <div className='right'>
                                <span className='call-type'>Voice Call</span>
                                <span className='call-total'>Click to join</span>
                            </div>
                        </div>
                    );
                case StatusJitsiMeet.ENDED:
                    return (
                        <div className='call-ended-content'>
                            <div className='left'>
                                <CallEndedIcon />
                            </div>
                            <div className='right'>
                                <span className='call-type'>Voice Call</span>
                                <span className='call-total'>43 giây</span>
                            </div>
                        </div>
                    );
                default:
                    return null;
            }

        case 'File':
            // Ensure message.content is of type IFileContent[]
            const fileContents = message.content as IFileContent[];
            return (
                <div className={clsx('media-content', isMe && 'media-content__me')}>
                    {fileContents?.map((item: IFileContent, index: number) => {
                        switch (item.type) {
                            case TypeStorageMessage.IMAGE:
                                return (
                                    <Image
                                        key={index}
                                        width={125}
                                        src={getImage(item.url, IMAGE_TYPE.PHOTO)}
                                        alt={item.file_name}
                                    />
                                );
                            case TypeStorageMessage.VIDEO:
                                return (
                                    <Image
                                        key={index}
                                        width={125}
                                        preview={{
                                            imageRender: () => (
                                                <video muted width='100%' controls src={item.url} />
                                            ),
                                            toolbarRender: () => null,
                                        }}
                                        src='/images/video_thumbnail.png'
                                        alt={item.file_name}
                                    />
                                );
                            case TypeStorageMessage.Doc:
                                return (
                                    <div key={`${item.file_name}_${index}`} className='media-content__doc'>
                                        <div className='media-content__doc__content'>
                                            <div className='media-content__doc__content__icon'><FileTextOutlined /></div>
                                            <div className='media-content__doc__content__name'>
                                                <div>{decodeURIComponent(item.file_name || item.url.substring(item.url.lastIndexOf('/') + 1))}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            default:
                                return (
                                    <Image
                                        key={index}
                                        width={125}
                                        alt={item?.file_name}
                                        preview={{
                                        imageRender: () => (
                                            <video muted width='100%' controls src={item?.url} />
                                        ),
                                        toolbarRender: () => null,
                                        }}
                                        src='/images/video_thumbnail.png'
                                    />
                                )
                        }
                    })}
                </div>
            );
    }
};