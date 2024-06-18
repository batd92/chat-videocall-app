import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { TypeFileStorage, IFileStorage } from '@/interface/response';
import { PictureOutlined, FileTextOutlined, LinkOutlined, VideoCameraOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { ENDPOINT } from '@/services/endpoint';
import { MessageService } from '@/services/message';
import './style.scss';
import { IFileContent, IGetMessagesResponse } from '@/interface/response/message/index';

interface MediaContainerProps {
    mediaKey: TypeFileStorage;
    roomId: string;
    onBack: () => void;
}

const MediaContainer: React.FC<MediaContainerProps> = ({ mediaKey, roomId, onBack }) => {
    const [mediaList, setMediaList] = useState<IGetMessagesResponse[]>([]);

    const { refetch: mediaInRoom } = useQuery(
        [ENDPOINT.MESSAGE.GET_MEDIA, roomId, mediaKey],
        () => MessageService.getMedia(roomId, mediaKey),
        {
            enabled: !!roomId && !!mediaKey,
            onSuccess: (response: any) => {
                setMediaList(response.data || []);
            },
        },
    );

    useEffect(() => {
        if (roomId && mediaKey) {
            mediaInRoom();
        }
    }, [roomId, mediaKey, mediaInRoom]);

    const renderMediaContent = () => {
        return mediaList.map((item, index) => {
            if (item.type.toString() === "File") {
                return (
                    ((item.content) as IFileContent[]).map((file, i) => (
                        <div key={`${index}-${i}`} className='media-item'>
                            {mediaKey === TypeFileStorage.IMAGE && <img src={file.url} alt={file.file_name} style={{ width: '100%' }} />}
                            {mediaKey === TypeFileStorage.DOC && <a href={file.url} target="_blank" rel="noopener noreferrer">{file.file_name}</a>}
                        </div>
                    ))
                );
            }
            if (item.type === "Link") {
                return (
                    (item.content as IFileContent[]).map((file, i) => (
                        <div key={`${index}-${i}`} className='media-item'>
                            {mediaKey === TypeFileStorage.LINK && <a href={file.url} target="_blank" rel="noopener noreferrer">{'This a link'}</a>}
                        </div>
                    ))
                );
            }
            return null;
        });
    };

    const renderIcon = () => {
        switch (mediaKey) {
            case TypeFileStorage.IMAGE:
                return <PictureOutlined />;
            case TypeFileStorage.VIDEO:
                return <VideoCameraOutlined />;
            case TypeFileStorage.PDF:
                return <FilePdfOutlined />;
            case TypeFileStorage.DOC:
                return <FileTextOutlined />;
            case TypeFileStorage.LINK:
                return <LinkOutlined />;
            default:
                return null;
        }
    };

    return (
        <div className='media-container'>
            <div className='media-header'>
                <div className='header-content'>
                    {renderIcon()} {mediaKey}
                </div>
                <Button onClick={onBack} className='back-button'>Back</Button>
            </div>
            <div className='media-content'>
                {renderMediaContent()}
            </div>
        </div>
    );
};

export default React.memo(MediaContainer);
