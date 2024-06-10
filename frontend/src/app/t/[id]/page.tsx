'use client'
import { MessageContent } from '@/modules/Message'

const DetailMessage = ({ params }: any) => {
    return <MessageContent roomId={params?.id} />
}

export default DetailMessage
