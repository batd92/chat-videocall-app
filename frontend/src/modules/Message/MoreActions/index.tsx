import { Popover } from 'antd'

interface IMoreAction {
  children: React.ReactNode
}

export const MoreAction: React.FC<IMoreAction> = ({ children }) => {
  const content = (
    <div>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae
      consequatur, adipisci sed magni porro mollitia. Rerum nulla nostrum culpa
      aliquam iusto, odio eos ipsam, velit soluta accusantium, quae nisi atque!
    </div>
  )
  return (
    <Popover open={false} content={content} title='Title' trigger='click'>
      {children}
    </Popover>
  )
}
