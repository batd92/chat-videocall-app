import React, { useCallback, useState } from "react";
import { Button, Input } from "antd";
import { useMutation } from "react-query";
import { ESocketEvent, UPLOAD_FILE_STATUS, UPLOAD_LIST_TYPE } from "@/utils/constants";
import { convertLinkToFileObject, convertToFileObjectAntd, getFileType, notificationMessage } from "@/utils/helpers";
import { useSocket } from "@/providers/Socket";
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

export const MessageFooter: React.FC<IProps> = ({
    roomId,
    setIsTyping,
    isTyping,
    replyingTo,
    setReplyingTo,
}: IProps) => {
    const { sendMessage } = useSocket();
    const [showAttachment, setShowAttachment] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([]);

    const { mutateAsync: uploadMedia } = useMutation(
        (file: any) => UploadService.uploadMedia(file),
        {
            onSuccess: (response) => {
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

    const handleChangeMessage = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputMessage(e.target.value);
        setIsTyping(!!e.target.value);

        sendMessage(
            JSON.stringify({
                event: ESocketEvent.TYPING_MESSAGE,
                payload: {
                    conversationId: roomId,
                    isTyping: !!e.target.value,
                },
            }),
        );
    }, [roomId, setIsTyping, sendMessage]);

    const handleRemoveFile = useCallback((removedFile: IUploadedFile) => {
        const result = uploadedFiles.filter(
            (file: IUploadedFile) => file.uid !== removedFile.uid,
        );
        setUploadedFiles(result);
    }, [uploadedFiles]);

    const handleSendMessage = useCallback(() => {
        if (inputMessage.trim() === '' && uploadedFiles.length === 0) return;

        let time = 0;
        const messageInfo = {
            conversationId: roomId,
            replyFromId: '',
        };

        if (replyingTo?._id) {
            messageInfo['replyFromId'] = replyingTo._id;
        }

        if (uploadedFiles.length > 0) {
            time = 1000;
            const messageFile = {
                ...messageInfo,
                type: 'File',
                content: uploadedFiles.map((file: IUploadedFile) => ({
                    url: file.url,
                    type: file.type,
                    file_name: file?.file_name,
                    size: file?.size,
                })),
            };

            sendMessage(
                JSON.stringify({
                    event: ESocketEvent.SEND_MESSAGE,
                    payload: {
                        message: messageFile,
                    },
                }),
            );

            setUploadedFiles([]);
            setShowAttachment(false);
        }

        if (inputMessage.trim() !== '') {
            const messageText = {
                ...messageInfo,
                type: 'Text',
                content: inputMessage,
            };

            setTimeout(() => {
                sendMessage(
                    JSON.stringify({
                        event: ESocketEvent.SEND_MESSAGE,
                        payload: {
                            message: messageText,
                        },
                    }),
                );
            }, time);

            setInputMessage('');
        }

        setReplyingTo(null);
    }, [roomId, uploadedFiles, replyingTo, sendMessage, setUploadedFiles, setShowAttachment, setInputMessage, setReplyingTo]);

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
                            onRemoveFiles={handleRemoveFile}
                            uploadedFiles={convertToFileObjectAntd(uploadedFiles)}
                            setUploadedFiles={setUploadedFiles}
                            filesLimit={6}
                        />
                    )}
                    <Input.TextArea
                        className='msg-input-inner'
                        placeholder='Type your message here...'
                        onChange={handleChangeMessage}
                        value={inputMessage}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        maxLength={2000}
                    />
                </div>
                <Button
                    type='link'
                    className='send-msg-btn'
                    onClick={handleSendMessage}
                    disabled={inputMessage === '' && uploadedFiles.length === 0}
                >
                    Send message
                </Button>
            </div>
        </div>
    );
};
