import { CallEndedIcon, CallIcon, SeenIcon, SentIcon } from "@/components/icons"
import { IMessage } from "@/types/common"
import { TypeFileStorage } from "@/types/response"
import { IMAGE_TYPE } from "@/utils/constants"
import { getImage } from "@/utils/helpers"
import { displayMessageTime } from "@/utils/helpers/index"
import { FileTextOutlined } from "@ant-design/icons"
import { Image } from "antd"
import clsx from "clsx"
import Linkify from 'react-linkify'

interface IProps {
  data: IMessage
  isMe: boolean
  isLastMsg: boolean
}

export const MessageText = ({ data, isLastMsg, isMe }: IProps) => {
    switch (data?.type) {
        case 'Text':
        case 'Link':
        return (
            <div
            className={clsx('message-content', isMe && 'message-content__me')}
            >
            <div className='message'>
                <Linkify
                componentDecorator={(
                    decoratedHref: string,
                    decoratedText: string,
                    key: number,
                ) => (
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
                {data?.content}
                </Linkify>
            </div>
            <div className='time'>
                {isMe && isLastMsg && (data.seen ? <SeenIcon /> : <SentIcon />)}
                {displayMessageTime(data?.createdAt)}
            </div>
            </div>
        )

        case 'Call':
        const callStatus = data?.content?.status
        switch (callStatus) {
            case 'Running':
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
            )
            case 'Ended':
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
            )

            default:
            return <></>
        }

        case 'File':
        return (
            <div className={clsx('media-content', isMe && 'media-content__me')}>
            {data?.content?.map((item: any, index: number) => {
                switch (item?.type) {
                case TypeFileStorage.IMAGE:
                    return (
                    <Image
                        key={index}
                        width={125}
                        src={getImage(item?.url, IMAGE_TYPE.PHOTO)}
                        alt={item?.file_name}
                    />
                    )
                case TypeFileStorage.VIDEO:
                    return (
                    <Image
                        key={index}
                        width={125}
                        preview={{
                        imageRender: () => (
                            <video muted width='100%' controls src={item?.url} />
                        ),
                        toolbarRender: () => null,
                        }}
                        src='/images/video_thumbnail.png'
                        alt={item?.file_name}
                    />
                    )
                case TypeFileStorage.DOC:
                    return (
                    <div key={`${item.messageId}_${index}`} className='media-content__doc'>
                        <div className='media-content__doc__content'>
                        <div className='media-content__doc__content__icon'><FileTextOutlined /></div>
                        <div className='media-content__doc__content__name'>
                            <div>{decodeURIComponent(item?.file_name || item.url.substring(item.url.lastIndexOf('/') + 1))}</div>
                        </div>
                        </div>
                    </div>
                    )
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
        )
    }
}