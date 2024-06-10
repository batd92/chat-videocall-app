import React, { useMemo } from "react";
import { CloseOutlined, FileImageOutlined, FileTextOutlined } from "@ant-design/icons";
import { Image } from "antd";
import { IMessage } from "@/types/common";
import { TypeFileStorage } from "@/types/response";
import { IMAGE_TYPE } from "@/utils/constants";
import { getImage } from "@/utils/helpers";
import './style.scss';

interface IProps {
    replyingTo: IMessage | null,
    setReplyingTo: (msg: IMessage | null) => void
  }

export const ReplyFooter: React.FC<IProps> = ({
    replyingTo,
    setReplyingTo,
}: IProps) => {
    const replyingToFileContent = useMemo(() => {
        if (!replyingTo || !replyingTo.content || !replyingTo.content[0]) {
            return null;
        }

        const { type, url, file_name: fileName } = replyingTo.content[0];
        return { type, url, fileName };
    }, [replyingTo]);

    const renderContentImage = () => {
        if (!replyingToFileContent) return null;
        if (replyingTo && replyingTo.content.length > 1) {
            return <div className='doc__content__icon'><FileImageOutlined /></div>;
        }

        switch (replyingToFileContent.type) {
            case TypeFileStorage.IMAGE:
                return (
                    <Image
                        height={40}
                        alt={replyingToFileContent.fileName}
                        src={getImage(replyingToFileContent.url, IMAGE_TYPE.PHOTO)}
                    />
                );
            case TypeFileStorage.VIDEO:
                return (
                    <Image
                        height={40}
                        alt={replyingToFileContent.fileName}
                        preview={{
                            imageRender: () => (
                                <video muted width='100%' controls src={replyingToFileContent.url} />
                            ),
                            toolbarRender: () => null,
                        }}
                        src='/images/video_thumbnail.png'
                    />
                );
            case TypeFileStorage.DOC:
                return <div className='doc__content__icon'><FileTextOutlined /></div>;
            default:
                return null;
        }
    }

    const renderMsgText = () => {
        if (!replyingTo) return '';
        if (replyingToFileContent && replyingToFileContent.type === TypeFileStorage.DOC) {
            return decodeURIComponent(replyingToFileContent.fileName || '');
        }
        return replyingToFileContent?.type === TypeFileStorage.VIDEO ? '[Videos]' : '[Images]';
    }

    return (
        <div className="reply-footer">
            <div className="container">
                <div className="container-icon" />
                {renderContentImage()}
                <div className="content">
                    <span className="content-user">{replyingTo?.user?.name}</span>
                    <div className="content-text">{renderMsgText()}</div>
                </div>
            </div>
            <div className="close-icon" onClick={() => setReplyingTo(null)}>
                <CloseOutlined />
            </div>
        </div>
    )
}
