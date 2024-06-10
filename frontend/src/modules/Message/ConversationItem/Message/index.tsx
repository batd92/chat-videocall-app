import { IMessage } from "@/types/common"
import clsx from "clsx"
import './style.scss'
import { MessageText } from "./MessageText"
import { ReplyMessage } from "./ReplyMessgae"

interface IProps {
    data: IMessage
    isMe: boolean
    isLastMsg: boolean
}

export const Message = ({ data, isLastMsg, isMe }: IProps) => {
    const handleRrdirectToReplyMsg = (msgId: string) => {
        const elementTarget = document.getElementById(msgId)
        if (elementTarget) {
            elementTarget.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
            return
        }
    }

    return (
        <div className="message">
            {data?.replyFrom?._id && <div onClick={() => handleRrdirectToReplyMsg(data?.replyFrom?._id)} className={clsx(["message-reply", {
                "message-reply-media": data?.replyFrom?.type === 'File'
            }])}>
                <ReplyMessage msg={data?.replyFrom} isMe={isMe} />
            </div>}
            <div className={clsx([{ "message-target": data?.replyFrom?._id }])}>
                <MessageText data={data} isLastMsg={isLastMsg} isMe={isMe} />
            </div>
        </div>
    )
}