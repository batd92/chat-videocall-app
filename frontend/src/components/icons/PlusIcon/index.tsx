import { ISvgIcon } from '@/interface/common'

export const PlusIcon: React.FC<ISvgIcon> = ({
  width = 24,
  height = 24,
  fillColor = 'black',
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
      <path fill='currentColor' d='M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z' />
    </svg>
  )
}
