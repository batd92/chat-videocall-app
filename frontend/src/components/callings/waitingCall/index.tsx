import React from 'react';
import { Avatar, Image, Modal, Row } from 'antd';
import './style.scss';
import { IGetRoomResponse } from '@/interface/response/room';

interface IModalWrap {
    room: IGetRoomResponse;
    isOpen: boolean;
    onCancel: () => void;
}

const WaitingCall: React.FC<IModalWrap> = ({ room, isOpen, onCancel }) => {
    const userId = 1;
    const randomChar = () => (Math.random() + 1).toString(36).substring(10);
    const participants = room.participants ? Array.from(new Set(room.participants)) : [];
    const participantFirst: any = participants.find((e: any) => e._id !== String(userId));

    const renderFooter = () => (
        <div className='waiting-call-card-footer'>
            <Image
                onClick={onCancel}
                style={{ cursor: 'pointer', display: 'inline-block' }}
                src='/images/phone-call-close-icon.png'
                height={50}
                preview={false}
                alt='Close call'
            />
        </div>
    );

    return (
        <Modal
            open={isOpen} // Use 'visible' instead of 'open' for Ant Design Modal
            closeIcon={null}
            footer={renderFooter()}
            className='waiting-call-modal'
            onCancel={onCancel}
        >
            <Row className='waiting-call-card' justify='center'>
                <div>
                    {room?.isGroup ? (
                        <div className='group'>
                            <h1 className='name'>
                                <strong>{room.name}</strong>
                            </h1>
                            {participants.map((participant: any, index) => (
                                <Avatar
                                    key={participant._id + randomChar()} // Ensure unique key for each participant
                                    className='avatar'
                                    src={participant.avatarUrl}
                                    alt={`Participant ${participant._id} avatar`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='not-group'>
                            <h1 className='name'>
                                <strong>User</strong>
                            </h1>
                            {participantFirst && (
                                <Avatar
                                    key={randomChar()} // Ensure unique key for participantFirst
                                    className='avatar'
                                    src={participantFirst.avatarUrl}
                                    alt={`Participant ${participantFirst._id} avatar`}
                                />
                            )}
                        </div>
                    )}
                </div>
            </Row>
        </Modal>
    );
};

export default WaitingCall;
