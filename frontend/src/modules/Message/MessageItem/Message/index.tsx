import clsx from "clsx"
import './style.scss'
import { MessageText } from "./MessageText"
import { ReplyMessage } from "./ReplyMessgae"
import { IGetMessagesResponse } from "@/interface/response"

interface IProps {
    message: IGetMessagesResponse
    isMe: boolean
    isLastMsg: boolean
}

export const Message = ({ message, isLastMsg, isMe }: IProps) => {
    const handleRrdirectToReplyMsg = (messageId: string | undefined) => {
        if (messageId) {
            const elementTarget = document.getElementById(messageId)
            if (elementTarget) {
                elementTarget.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                })
                return
            }
        }
    }

    return (
        <div className="message">
            {message.messageRepy?._id && <div onClick={() => handleRrdirectToReplyMsg(message.messageRepy?._id)} className={clsx(["message-reply", {
                "message-reply-media": message?.messageRepy?.type === 'File'
            }])}>
                <ReplyMessage message={message?.messageRepy} isMe={isMe} />
            </div>}
            <div className={clsx([{ "message-target": message?.messageRepy?._id }])}>
                <MessageText message={message} isLastMsg={isLastMsg} isMe={isMe} />
            </div>
        </div>
    )
}