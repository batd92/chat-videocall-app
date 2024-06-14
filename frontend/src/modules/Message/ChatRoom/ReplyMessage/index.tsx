import React, { useMemo, useState, useEffect } from "react";
import { CloseOutlined, FileImageOutlined, FileTextOutlined } from "@ant-design/icons";
import { Image } from "antd";
import { IMessage } from "@/interface/common";
import { TypeFileStorage } from "@/interface/response";
import { IMAGE_TYPE } from "@/utils/constants";
import { getImage } from "@/utils/helpers";
import './style.scss';

interface IProps {
    replyingTo: IMessage | null;
}

export const ReplyMessage: React.FC<IProps> = ({ replyingTo }) => {
    const [currentReplyingTo, setCurrentReplyingTo] = useState<IMessage | null>(replyingTo);

    // Update internal state when replyingTo prop changes
    useEffect(() => {
        setCurrentReplyingTo(replyingTo);
    }, [replyingTo]);

    const replyingToFileContent = useMemo(() => {
        const content = currentReplyingTo?.content?.[0];
        if (!content) return null;

        const { type, url, file_name: fileName } = content;
        return { type, url, fileName };
    }, [currentReplyingTo]);

    const renderContentImage = () => {
        if (!replyingToFileContent) return null;
        const { type, url, fileName } = replyingToFileContent;

        if (currentReplyingTo?.content.length > 1) {
            return <div className="doc__content__icon"><FileImageOutlined /></div>;
        }

        switch (type) {
            case TypeFileStorage.IMAGE:
                return <Image height={40} alt={fileName} src={getImage(url, IMAGE_TYPE.PHOTO)} />;
            case TypeFileStorage.VIDEO:
                return (
                    <Image
                        height={40}
                        alt={fileName}
                        preview={{
                            imageRender: () => <video muted width="100%" controls src={url} />,
                            toolbarRender: () => null,
                        }}
                        src="/images/video_thumbnail.png"
                    />
                );
            case TypeFileStorage.DOC:
                return <div className="doc__content__icon"><FileTextOutlined /></div>;
            default:
                return null;
        }
    };

    const renderMsgText = () => {
        if (!currentReplyingTo) return '';
        const { type, fileName } = replyingToFileContent || {};

        if (type === TypeFileStorage.DOC) {
            return decodeURIComponent(fileName || '');
        }

        return type === TypeFileStorage.VIDEO ? '[Videos]' : '[Images]';
    };

    return (
        <div className="reply-footer">
            <div className="container">
                <div className="container-icon" />
                {renderContentImage()}
                <div className="content">
                    <span className="content-user">{currentReplyingTo?.user?.name}</span>
                    <div className="content-text">{renderMsgText()}</div>
                </div>
            </div>
            <div className="close-icon" onClick={() => setCurrentReplyingTo(null)}>
                <CloseOutlined />
            </div>
        </div>
    );
};
