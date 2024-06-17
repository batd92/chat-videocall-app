import { IGetRoomResponse } from '@/interface/response/room';
import { Avatar, Image, Modal, Row } from 'antd';
import React from 'react';
import './style.scss';

interface IModalWrap {
    room: IGetRoomResponse;
    isOpen: boolean;
    onCancel: () => void;
}

const WaitingCall: React.FC<IModalWrap> = ({ room, isOpen, onCancel }) => {
    const userId = 1;
    const participantFirst = room.participants?.find((participant: any) => participant._id !== userId);

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
            open={isOpen}
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
                            {room.participants.map((participant: any, index: number) => (
                                <Avatar
                                    key={`${participant._id}-${index}`} // Ensure unique key
                                    className='avatar'
                                    src={participant.avatarUrl}
                                    alt='participant avatar'
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
                                    key={participantFirst._id} // Use the participant's id as the key
                                    className='avatar'
                                    src={participantFirst.avatarUrl}
                                    alt='participant avatar'
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
