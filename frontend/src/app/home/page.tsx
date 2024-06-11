'use client'

import { MessageContent } from '@/modules/Message'
import './style.scss'

const MessagePage = ({ params }: any) => {
    return <MessageContent roomId={params?.id} />
}

export default MessagePage
