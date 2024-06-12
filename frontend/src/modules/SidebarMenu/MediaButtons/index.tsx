import React from 'react'
import { Button } from 'antd'
import { FileGifOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons'
import { TypeFileStorage } from '@/interface/response'

interface MediaButtonsProps {
    onMediaClick: (key: TypeFileStorage) => void
}

const MediaButtons: React.FC<MediaButtonsProps> = ({ onMediaClick }) => {
    return (
        <div className='list-button'>
            <Button onClick={() => onMediaClick(TypeFileStorage.IMAGE)}>
                <FileGifOutlined />
                <span>Media files</span>
            </Button>
            <Button onClick={() => onMediaClick(TypeFileStorage.DOC)}>
                <FileTextOutlined />
                <span>Files</span>
            </Button>
            <Button onClick={() => onMediaClick(TypeFileStorage.LINK)}>
                <LinkOutlined />
                <span>Links</span>
            </Button>
        </div>
    )
}

export default React.memo(MediaButtons)
