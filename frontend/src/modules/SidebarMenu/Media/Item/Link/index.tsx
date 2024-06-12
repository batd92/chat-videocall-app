import { IFileStorage } from "@/interface/response"
import { LinkOutlined } from "@ant-design/icons"
import Linkify from 'react-linkify'
import './style.scss'

interface IMediaLinks {
    list: IFileStorage[]
}

export const MediaLinksContainer = ({ list }: IMediaLinks) => {
    return (
        <div className="media-content">
            {list?.length ? <div className='media-item__listLinks'>
                {list?.map((item, index) => {
                    return (
                        <div key={`${item.messageId}_${index}`} className='media-item__listLinks__item'>
                            <div className='media-item__listLinks__item__content'>
                                <div className='media-item__listLinks__item__content__icon'><LinkOutlined /></div>
                                <div className='media-item__listLinks__item__content__name'>
                                    <Linkify
                                        componentDecorator={(
                                            _decoratedHref: string,
                                            decoratedText: string,
                                            key: number,
                                        ) => (
                                            <a
                                                href={item.url}
                                                key={key}
                                                rel='noopener noreferrer'
                                                target='_blank'
                                            >
                                                {decoratedText}
                                            </a>
                                        )}
                                    >
                                        {item.url}
                                    </Linkify>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div> : (
                <div className="no-data">No Links</div>
            )}
        </div>
    )
}
