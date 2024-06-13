import React from 'react'
import { Button } from 'antd'
import { TypeFileStorage } from '@/interface/response'
import { PictureOutlined, FileTextOutlined, LinkOutlined, VideoCameraOutlined, FilePdfOutlined } from '@ant-design/icons'

interface MediaContainerProps {
    mediaKey: TypeFileStorage
    list: { type: string; url: string; name: string }[]
    onBack: () => void
}

const MediaContainer: React.FC<MediaContainerProps> = ({ mediaKey, list, onBack }) => {
    const renderMediaContent = () => {
        switch (mediaKey) {
            case TypeFileStorage.IMAGE:
                return list.filter(item => item.type === TypeFileStorage.IMAGE).map((item, index) => (
                    <div key={index}>
                        <img src={item.url} alt={item.name} style={{ width: '100%' }} />
                    </div>
                ))
            case TypeFileStorage.VIDEO:
                return list.filter(item => item.type === TypeFileStorage.VIDEO).map((item, index) => (
                    <div key={index}>
                        <video controls src={item.url} style={{ width: '100%' }} />
                    </div>
                ))
            case TypeFileStorage.PDF:
                return list.filter(item => item.type === TypeFileStorage.PDF).map((item, index) => (
                    <div key={index}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>
                    </div>
                ))
            case TypeFileStorage.DOC:
                return list.filter(item => item.type === TypeFileStorage.DOC).map((item, index) => (
                    <div key={index}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>
                    </div>
                ))
            case TypeFileStorage.LINK:
                return list.filter(item => item.type === TypeFileStorage.LINK).map((item, index) => (
                    <div key={index}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>
                    </div>
                ))
            default:
                return null
        }
    }

    const renderIcon = () => {
        switch (mediaKey) {
            case TypeFileStorage.IMAGE:
                return <PictureOutlined />
            case TypeFileStorage.VIDEO:
                return <VideoCameraOutlined />
            case TypeFileStorage.PDF:
                return <FilePdfOutlined />
            case TypeFileStorage.DOC:
                return <FileTextOutlined />
            case TypeFileStorage.LINK:
                return <LinkOutlined />
            default:
                return null
        }
    }

    return (
        <div className='media-container'>
            <Button onClick={onBack}>Back</Button>
            <h2>
                <br></br>
                {renderIcon()} {mediaKey}</h2>
            <div className='media-content'>
                {renderMediaContent()}
            </div>
        </div>
    )
}

export default React.memo(MediaContainer)
