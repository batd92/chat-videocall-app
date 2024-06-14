import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { Button, Input } from "antd";
import { useMutation } from "react-query";
import { UPLOAD_FILE_STATUS, UPLOAD_LIST_TYPE } from "@/utils/constants";
import { convertLinkToFileObject, convertToFileObjectAntd, getFileType, notificationMessage } from "@/utils/helpers";
import { UploadService } from "@/services/upload";
import { IMessage, IUploadedFile } from "@/interface/common";
import { UploadWrap } from "@/components/commons";
import { AttachmentIcon } from "@/components/icons";
import { ReplyMessage } from "./ReplyMessage";
import useChat from "@/services/socket/useChat";
import useTyping from "@/services/socket/useTyping";

interface IProps {
    roomId: string;
    messageTo: IMessage | null
}

export const ChatRoom: React.FC<IProps> = ({
    roomId,
    messageTo
}: IProps) => {
    const {
        sendMessage,
        startTypingMessage,
        stopTypingMessage,
    } = useChat(roomId as string);

    const [showAttachment, setShowAttachment] = useState<boolean>(false);
    const [inqueryMessage, setInQueryMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([]);
    const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();
    
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
     * Check typing message
     */
    useEffect(() => {
        if (isTyping) startTypingMessage();
        else stopTypingMessage();
    }, [isTyping]);

    /**
     * Change message
     */
    const onChangeMessage = (event: FormEvent<HTMLInputElement>) => {
        setInQueryMessage(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
    };

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
    const onSendMessageToServer = (event: FormEvent<HTMLInputElement>) => {
        console.log('onSendMessageToServer ...', inqueryMessage)
        event.preventDefault();
        cancelTyping();

        // build payload
        const payloadBase = {
            replyFromId: messageTo?._id ? messageTo._id : '',
        };

        // send file
        if (uploadedFiles.length > 0) {
            const payloadFile = {
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
            sendMessage(payloadFile);

            setInQueryMessage('');
            setUploadedFiles([]);
            setShowAttachment(false);
        }

        // send text
        if (inqueryMessage) {
            const payloadText = {
                ...payloadBase,
                type: 'Text',
                content: inqueryMessage,
            };
            sendMessage(payloadText);
            setInQueryMessage('');
        }
    };

    return (
        <div>
            {messageTo && (
                <ReplyMessage replyingTo={messageTo} />
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
                        maxLength={2000}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        onChange={onChangeMessage}
                        value={inqueryMessage}
                        onKeyPress={startTyping}
                        onKeyUp={stopTyping}
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
