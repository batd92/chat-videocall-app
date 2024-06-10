import { IReplyFromMessage } from "@/types/common"
import { TypeFileStorage } from "@/types/response"
import { IMAGE_TYPE } from "@/utils/constants"
import { getImage } from "@/utils/helpers"
import { FileTextOutlined } from "@ant-design/icons"
import { Image } from "antd"
import clsx from "clsx"
import Linkify from 'react-linkify'

interface IProps {
  msg: IReplyFromMessage
  isMe: boolean
}

export const ReplyMessage = ({ msg, isMe }: IProps) => {
  switch (msg?.type) {
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
              {msg?.content}
            </Linkify>
          </div>
        </div>
      )
    case 'File':
      return (
        <div className={clsx('media-content', isMe && 'media-content__me')}>
          {msg?.content?.map((item: any, index: number) => {
            switch (item?.type) {
              case TypeFileStorage.IMAGE:
                return (
                  <Image
                    key={index}
                    width={100}
                    src={getImage(item?.url, IMAGE_TYPE.PHOTO)}
                    alt={item?.file_name}
                    preview={false}
                  />
                )
              case TypeFileStorage.VIDEO:
                return (
                  <Image
                    key={index}
                    width={100}
                    alt={item?.file_name}
                    preview={false}
                    src='/images/video_thumbnail.png'
                  />
                )
              case TypeFileStorage.DOC:
                return (
                  <div key={`${item.messageId}_${index}`} className='content__doc'>
                    <div className='doc__content'>
                      <div className='doc__content__icon'><FileTextOutlined /></div>
                      <div className='doc__content__name'>
                        <div>{decodeURIComponent(item?.file_name || item.url.substring(item.url.lastIndexOf('/') + 1))}</div>
                      </div>
                    </div>
                  </div>
                )
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
      )
  }
}