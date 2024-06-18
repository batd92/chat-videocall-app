import React from 'react';
import { Avatar, Modal, Row, Button } from 'antd';
import './style.scss';
import { IGetRoomResponse } from '@/interface/response/room/index';

interface IModalWrap {
    room: IGetRoomResponse | {};
    isOpen: boolean
    onCancel: () => void
    onOk: () => void
}

const IncomingCall: React.FC<IModalWrap> = ({ room, isOpen, onCancel, onOk }) => {
    const userId = 1; // Example userId, replace with your actual logic
    const participants = room?.participants ? Array.from(new Set(room.participants)) : [];
    const participantFirst = participants.find((e: any) => e.userId !== String(userId));

    const randomChar = () => (Math.random() + 1).toString(36).substring(10);

    return (
        <Modal
            visible={isOpen} // Corrected prop name to visible
            onCancel={onCancel}
            footer={null}
            className='incoming-call-modal'
            centered
            closable={false}
        >
            <Row className='incoming-call-card' justify='center'>
                <div>
                    {room && (
                        <>
                            {room.isGroup ? (
                                <div className='group'>
                                    <p>Incoming call from: </p>
                                    <h1 className='name'>
                                        <strong>{room.name}</strong>
                                    </h1>
                                    <div className='avatar-group'>
                                        {participants.map((participant: any) => (
                                            <Avatar
                                                className='avatar'
                                                key={participant._id + randomChar()}
                                                src={participant.avatarUrl}
                                                alt='Participant avatar'
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className='not-group'>
                                    <h1 className='name'>
                                        <strong>{participantFirst?.username}</strong>
                                    </h1>
                                    <Avatar
                                        key={randomChar()}
                                        className='avatar'
                                        src={participantFirst?.avatarUrl}
                                        alt='Participant avatar'
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className='incoming-call-card-footer'>
                    <Button className='reject-button' onClick={onCancel}>Reject</Button>
                    <Button className='accept-button' type='primary' onClick={onOk}>Accept</Button>
                </div>
            </Row>
        </Modal>
    );
};

export default IncomingCall;
