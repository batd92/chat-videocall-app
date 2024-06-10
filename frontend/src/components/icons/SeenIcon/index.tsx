import { ISvgIcon } from '@/types/common'

export const SeenIcon: React.FC<ISvgIcon> = ({
  width = 18,
  height = 18,
  strokeColor = 'var(--color-green-1)',
  ...props
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 24 24'
      {...props}
    >
      <path
        fill='none'
        stroke={strokeColor}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='m8 12.485l4.243 4.243l8.484-8.485M3 12.485l4.243 4.243m8.485-8.485L12.5 11.5'
      />
    </svg>
  )
}
