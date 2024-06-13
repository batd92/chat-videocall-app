import React, { useCallback, useState } from "react";
import { Button, Input } from "antd";
import { useMutation } from "react-query";
import { ESocketEvent, UPLOAD_FILE_STATUS, UPLOAD_LIST_TYPE } from "@/utils/constants";
import { convertLinkToFileObject, convertToFileObjectAntd, getFileType, notificationMessage } from "@/utils/helpers";
import { UploadService } from "@/services/upload";
import { IMessage, IUploadedFile } from "@/interface/common";
import { UploadWrap } from "@/components/commons";
import { AttachmentIcon } from "@/components/icons";
import { ReplyFooter } from "./Reply";

interface IProps {
    roomId: string;
    setIsTyping: (value: boolean) => void;
    isTyping: boolean;
    replyingTo: IMessage | null;
    setReplyingTo: (msg: IMessage | null) => void;
}

export const AreaChat: React.FC<IProps> = ({
    roomId,
    setIsTyping,
    isTyping,
    replyingTo,
    setReplyingTo,
}: IProps) => {
    const [showAttachment, setShowAttachment] = useState<boolean>(false);
    const [inqueryMessage, setInQueryMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([]);

    const { mutateAsync: uploadMedia } = useMutation(
        (file: any) => UploadService.uploadMedia(file),
        {
            onSuccess: (response: any) => {
                if (!response?.data) return;
                setUploadedFiles((prev) => [
                    ...prev,
                    {
                        ...convertLinkToFileObject(
                            response.data._id,
                            response.data.path,
                            UPLOAD_FILE_STATUS.DONE,
                            getFileType(response.data.mimetype),
                        ),
                        size: response.data?.size,
                        file_name: response.data?.file_name,
                    },
                ]);
            },
            onError: (error: any) => {
                notificationMessage({
                    message: error.message,
                    type: 'error',
                });
            },
        },
    );

    const handleChangeFile = useCallback((fileInfo: { file: IUploadedFile; fileList: IUploadedFile[] }) => {
        if (fileInfo.file.status !== 'removed') {
            uploadMedia(fileInfo.file?.originFileObj || fileInfo.file);
        }
    }, [uploadMedia]);

    /**
     * Typing message
     */
    const onTypingMessage = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInQueryMessage(e.target.value);
        setIsTyping(!!e.target.value);

        // send typing to socket
        //alert('send typing to socket');
    }, [roomId, setIsTyping]);

    /**
     * Remove file
     */
    const onRemoveFile = useCallback((removedFile: IUploadedFile) => {
        const result = uploadedFiles.filter(
            (file: IUploadedFile) => file.uid !== removedFile.uid,
        );
        setUploadedFiles(result);
    }, [uploadedFiles]);

    /**
     * Send message to server by socket
     */
    const onSendMessageToServer = useCallback(() => {
        if (!inqueryMessage) return;
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        // build payload
        const payloadBase = {
            roomId: roomId,
            replyFromId: replyingTo?._id ? replyingTo._id: '',
        };

        // send file
        if (uploadedFiles.length > 0) {
            const payload = {
                ...payloadBase,
                type: 'File',
                content: uploadedFiles.map((file: IUploadedFile) => ({
                    url: file.url,
                    type: file.type,
                    file_name: file?.file_name,
                    size: file?.size,
                })),
            };
            // send messsge to socket
            setUploadedFiles([]);
            setShowAttachment(false);
            alert('send file');
        }

        // send text
        if (inqueryMessage) {
            const payloadText = {
                ...payloadBase,
                type: 'Text',
                content: inqueryMessage,
            };

            setInQueryMessage('');
            alert('send text');
        }

        setReplyingTo(null);
    }, [roomId, uploadedFiles, replyingTo, setUploadedFiles, setShowAttachment, setInQueryMessage, setReplyingTo]);

    return (
        <div>
            {replyingTo && (
                <ReplyFooter replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
            )}
            <div className='footer footer-new-chat'>
                <Button
                    type='link'
                    icon={<AttachmentIcon />}
                    onClick={() => setShowAttachment((prev) => !prev)}
                />
                <div className='msg-input'>
                    {showAttachment && (
                        <UploadWrap
                            listType={UPLOAD_LIST_TYPE.PICTURE_CARD}
                            onChangeFiles={handleChangeFile}
                            onRemoveFiles={onRemoveFile}
                            uploadedFiles={convertToFileObjectAntd(uploadedFiles)}
                            setUploadedFiles={setUploadedFiles}
                            filesLimit={6}
                        />
                    )}
                    <Input.TextArea
                        className='msg-input-inner'
                        placeholder='Type your message here...'
                        onChange={onTypingMessage}
                        value={inqueryMessage}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        maxLength={2000}
                    />
                </div>
                <Button
                    type='link'
                    className='send-msg-btn'
                    onClick={onSendMessageToServer}
                    disabled={inqueryMessage === '' && uploadedFiles.length === 0}
                >
                    Send
                </Button>
            </div>
        </div>
    );
};
