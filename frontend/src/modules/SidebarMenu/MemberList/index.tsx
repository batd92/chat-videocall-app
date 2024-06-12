import React from 'react'
import { Button } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { AvatarWrap } from '@/components/commons/AvatarWrap'

interface MemberListProps {
    participants: any[]
    onAddMemberClick: () => void
}

const MemberList: React.FC<MemberListProps> = ({ participants, onAddMemberClick }) => {
    return (
        <div className='list-button'>
            {participants.map((participant: any) => (
                <div className='list-member' key={participant._id}>
                    <AvatarWrap size={42} src={participant.avatar} isOnline={participant.isOnline} />
                    {participant.name}
                </div>
            ))}
            <Button onClick={onAddMemberClick}>
                <UserAddOutlined />
                <span>Add members</span>
            </Button>
        </div>
    )
}

export default React.memo(MemberList)
