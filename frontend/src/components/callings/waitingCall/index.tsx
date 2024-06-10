'use client'

import { IGetRoomResponse } from '@/types/response/room'
import { Avatar, Image, Modal, Row } from 'antd'
import React from 'react'
import './style.scss'

interface IModalWrap {
    conversation: IGetRoomResponse
    isOpen: boolean
    onCancel: () => void
}
const WaitingCall: React.FC<IModalWrap> = ({
    conversation,
    isOpen = false,
    onCancel,
}) => {
    const userId = 1

    const participantFirst = conversation?.participants?.filter(
        (e) => e._id !== String(userId),
    )[0]
    const renderFooter = () => {
        return (
            <div className='waiting-call-card-footer'>
                <Image
                    onClick={onCancel}
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                    src='/images/phone-call-close-icon.png'
                    height={'50px'}
                    preview={false}
                    alt='description of image'
                />
            </div>
        )
    }
    return (
        <>
            <Modal
                open={isOpen}
                closeIcon={<></>}
                footer={renderFooter()}
                className='waiting-call-modal'
            >
                <Row className='waiting-call-card' justify='center'>
                    <div>
                        {conversation?.isGroup ? (
                            <div className='group'>
                                <h1 className='name'>
                                    <strong>{conversation.name}</strong>
                                </h1>
                                {conversation.participants.map((participant) => (
                                    <Avatar
                                        className='avatar'
                                        key={participant._id}
                                        src={participant.avatar}
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
                                    src={participantFirst?.avatar}
                                    alt='description of image'
                                />
                            </div>
                        )}
                    </div>
                </Row>
            </Modal>
        </>
    )
}

export default WaitingCall
