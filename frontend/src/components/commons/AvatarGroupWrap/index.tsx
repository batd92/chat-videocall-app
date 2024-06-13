/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { IParticipant } from '@/interface/response';
import { IMAGE_TYPE } from '@/utils/constants';
import { getImage } from '@/utils/helpers';
import './style.scss';

interface IAvatarGroupWrapProps {
    users: IParticipant[];
    isOnline?: boolean;
}

export const AvatarGroupWrap: React.FC<IAvatarGroupWrapProps> = ({
    users,
    isOnline,
}) => {
    const renderAvatars = () => {
        return users?.slice(0, 2)?.map((user) => (
            <div className='avatar' key={user._id}>
                <img src={getImage(user.avatarUrl, IMAGE_TYPE.AVATAR)} alt='' />
            </div>
        ));
    };

    return (
        <div className='c-avatar-group-wrap'>
            {renderAvatars()}
            {isOnline && (
                <div className='status-indicator'>
                    <div className='indicator-dot' />
                </div>
            )}
        </div>
    );
};
