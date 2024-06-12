import { ISvgIcon } from '@/interface/common'

export const SidebarIcon: React.FC<ISvgIcon> = ({
  width = 24,
  height = 24,
  strokeColor = 'var(--color-primary)',
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
      <g
        fill='none'
        stroke={strokeColor}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      >
        <rect width='18' height='18' x='3' y='3' rx='2' />
        <path d='M9 3v18m7-6l-3-3l3-3' />
      </g>
    </svg>
  )
}
