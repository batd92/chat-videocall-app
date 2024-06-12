import { IFileStorage } from "@/interface/response"
import { DownloadOutlined, FileTextOutlined, MoreOutlined } from "@ant-design/icons"
import { Dropdown, MenuProps } from "antd"
import './style.scss'
import { downloadFileByUrl } from "@/utils/helpers/file"

interface IMediaDocs {
    list: IFileStorage[]
}

export const MediaDocsContainer = ({ list }: IMediaDocs) => {

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

            {list?.length ? <div className='media-item__listDocs'>
                {list?.map((item, index) => {
                    return (
                        <div key={`${item.messageId}_${index}`} className='media-item__listDocs__item'>
                            <div className='media-item__listDocs__item__content'>
                                <div className='media-item__listDocs__item__content__icon'><FileTextOutlined /></div>
                                <div className='media-item__listDocs__item__content__name'>
                                    <div>{decodeURIComponent(item?.file_name || item.url.substring(item.url.lastIndexOf('/') + 1))}</div>
                                    <div style={{ fontWeight: 500 }}>{`${item?.size || 0} kb`}</div>
                                </div>
                            </div>
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
                <div className="no-data">No Files</div>
            )}
        </div>
    )
}
