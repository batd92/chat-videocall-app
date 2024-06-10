/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { getImage } from '@/utils/helpers';
import './style.scss';
import { IMAGE_TYPE } from '@/utils/constants';

interface IAvatarWrapProps {
    size?: number | string;
    src: string | null;
    isOnline?: boolean;
}

export const AvatarWrap: React.FC<IAvatarWrapProps> = ({
    isOnline,
    src,
    size = 40,
}) => {
    return (
        <div className='avatar-wrap'>
            <img
                style={{ width: size, height: size }}
                className='profile-picture'
                src={getImage(src, IMAGE_TYPE.AVATAR)}
                alt=''
            />
            {isOnline && <span className='status-indicator'></span>}
        </div>
    );
};