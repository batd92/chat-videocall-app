import { Tooltip, TooltipProps } from 'antd'

export const TooltipWrap: React.FC<TooltipProps> = ({
    className,
    children,
    ...props
}) => {
    return (
        <Tooltip className={className} {...props}>
            {children}
        </Tooltip>
    )
}
