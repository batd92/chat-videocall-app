import { ISvgIcon } from '@/types/common'

export const SentIcon: React.FC<ISvgIcon> = ({
  width = 18,
  height = 18,
  fillColor = 'var(--color-green-1)',
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
        fill={fillColor}
        d='M9.84 17.08a.997.997 0 0 1-.707-.293l-3.84-3.84a1 1 0 1 1 1.414-1.414l3.133 3.133l7.453-7.453a1 1 0 0 1 1.414 1.414l-8.16 8.16a.997.997 0 0 1-.707.293'
      />
    </svg>
  )
}
