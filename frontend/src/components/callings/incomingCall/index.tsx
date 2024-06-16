import { IGetRoomResponse } from '@/interface/response/room'
import { Avatar, Modal, Row } from 'antd'
import React from 'react'
import './style.scss'

interface IModalWrap {
    conversation: IGetRoomResponse
    isOpen: boolean
    onCancel: () => void
    onOkay: () => void
}
const IncomingCall: React.FC<IModalWrap> = ({
    conversation,
    isOpen = false,
    onCancel,
    onOkay,
}) => {
    const userId = 1

    const participantFirst = conversation?.participants?.filter(
        (e) => e._id !== String(userId),
    )[0]

    const renderFooter = () => (
        <div className='incoming-call-card-footer'>
            <Modal
                onCancel={onCancel}
                closeIcon={null}
                footer={null}
                open={isOpen}
            >
                <Row className='incoming-call-card' justify='center'>
                    <div>
                        {conversation && (
                            <>
                                {conversation.isGroup ? (
                                    <div className='group'>
                                        <h1 className='name'>
                                            <strong>{conversation.name}</strong>
                                        </h1>
                                        {conversation.participants.map((participant: any) => (
                                            <Avatar
                                                className='avatar'
                                                key={participant._id}
                                                src={participant.avatarUrl}
                                                alt='description of image'
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className='not-group'>
                                        <h1 className='name'>
                                            <strong>Quy NT</strong>
                                        </h1>
                                        <Avatar
                                            className='avatar'
                                            src={participantFirst?.avatarUrl}
                                            alt='description of image'
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Row>
            </Modal>
        </div>
    )

    return (
        <Modal
            onCancel={onCancel}
            closeIcon={null}
            footer={renderFooter()}
            open={isOpen}
            className='incoming-call-modal'
        />
    )
}

export default IncomingCall
