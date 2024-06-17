import { IFileStorage, TypeFileStorage } from "@/interface/response"
import { IMAGE_TYPE } from "@/utils/constants"
import { getImage } from "@/utils/helpers"
import { DownloadOutlined, MoreOutlined } from "@ant-design/icons"
import { Dropdown, Image, MenuProps } from "antd"
import './style.scss'
import { downloadFileByUrl } from "@/utils/helpers/file"

interface IMediaImages {
    list: IFileStorage[]
}

export const MediaImagesContainer = ({ list }: IMediaImages) => {

    const onDownload = (file: IFileStorage) => {
        if (!file) return
        downloadFileByUrl(file.url, decodeURIComponent(file?.file_name || file.url.substring(file.url.lastIndexOf('/') + 1)))
    }

    const messsageActions = (item: IFileStorage) => {
        return (
            [
                {
                    label: (
                        <div onClick={() => onDownload(item)}>
                            <p className='action_name'>
                                <DownloadOutlined /> Download
                            </p>
                        </div>
                    ),
                    key: '0',
                },
            ] as MenuProps['items']
        )
    }

    return (
        <div className="media-content">
            {list?.length ? <div className='media-item__listImg'>
                {list?.map((item, index: number) => {
                    return (
                        <div key={item.messageId || index} className='media-item__listImg__item'>
                            <Image
                                key={index}
                                width="100%"
                                src={item?.type === TypeFileStorage.IMAGE ? getImage(item?.url, IMAGE_TYPE.PHOTO) : '/images/video_thumbnail.png'}
                                preview={false}
                                alt={item?.file_name}
                            />
                            <div className='options'>
                                <Dropdown
                                    menu={{ items: messsageActions(item) }}
                                    trigger={['click']}
                                    placement='topRight'
                                    arrow={{ pointAtCenter: true }}
                                >
                                    <MoreOutlined />
                                </Dropdown>
                            </div>
                        </div>
                    )
                })}
            </div> : (
                <div className="no-data">No Images/Videos</div>
            )}
        </div>
    )
}
