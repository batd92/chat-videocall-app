import { IFileStorage, TypeFileStorage } from "@/types/response"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { Tabs, TabsProps } from "antd"
import './style.scss'
import { MediaImagesContainer } from "./Item/Image"
import { MediaDocsContainer } from "./Item/Doc"
import { MediaLinksContainer } from "./Item/Link"
import { useMemo } from "react"

interface IMedia {
  list: IFileStorage[]
  activeKey: `${TypeFileStorage}`
  onChangeKey: (keyValue: any) => void
}

export const MediaContainer = ({list, activeKey = TypeFileStorage.IMAGE, onChangeKey}: IMedia) => {
  const mediaData = useMemo(() => {
    let data: {
      images: IFileStorage[],
      docs: IFileStorage[],
      link: IFileStorage[],
    } = {
      images: [],
      docs: [],
      link: []
    }

    list.forEach((el) => {
      if (el.type === TypeFileStorage.IMAGE || el.type === TypeFileStorage.VIDEO) {
        data.images.push(el)
      }
      if (el.type === TypeFileStorage.PDF || el.type === TypeFileStorage.DOC) {
        data.docs.push(el)
      }
      if (el.type === TypeFileStorage.LINK) {
        data.link.push(el)
      }
    })

    return data
  }, [list])

  const items: TabsProps['items'] = [
    {
      key: 'media',
      label: 'Media',
      children: <MediaImagesContainer list={mediaData.images} />,
    },
    {
      key: 'file',
      label: 'File',
      children: <MediaDocsContainer list={mediaData.docs} />,
    },
    {
      key: 'links',
      label: 'Links',
      children: <MediaLinksContainer list={mediaData.link} />,
    },
  ]

  return (
    <div className='media-container'>
      <div className='media-container__header'>
        <div onClick={() => onChangeKey(null)}><ArrowLeftOutlined /></div>
        <span>Media files, files and links</span>
      </div>
      <Tabs className='media-container__content' defaultActiveKey={activeKey} items={items} onChange={onChangeKey} />
    </div>
  )
}
