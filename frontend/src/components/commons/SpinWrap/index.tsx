import React from 'react';
import { Spin, SpinProps } from 'antd';

interface ISpinWrapProps extends SpinProps {
    children?: React.ReactNode;
}

export const SpinWrap: React.FC<ISpinWrapProps> = ({
    tip = 'Đang tải',
    className,
    children,
    ...props
}) => {
    return (
        <Spin className={className} tip={tip} {...props}>
            {children}
        </Spin>
    );
};