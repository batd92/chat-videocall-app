import { AvatarWrap } from '@/components/commons/AvatarWrap'
import {
  EditOutlined,
  FileGifOutlined,
  FileTextOutlined,
  LinkOutlined,
  LogoutOutlined,
  PictureOutlined,
  SearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { Button, Collapse, CollapseProps, Drawer, Divider, Input } from 'antd'
import './style.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import ModalNewRoom from '../ModalRoom/UpdateRoom'
import {
  IGetMessagesResponse,
  IGetRoomResponse,
  TypeFileStorage,
} from '@/types/response'
import { MediaContainer } from './Media'
import InfiniteScroll from 'react-infinite-scroll-component'
import { IMessage } from '@/types/common/index'
import { useMutation, useQuery } from 'react-query'
import { MessageService } from '@/services'
import moment from 'moment'
import { IGetMessagesKeyWordRequest } from '@/types/request'
import { ENDPOINT } from '@/services/endpoint'
import { getUserById } from '@/utils/helpers'
import UploadAvatar from './UploadAvatar'

interface IProps {
  open: boolean
  cancel: () => void
  avatar: React.ReactNode
  name: string | undefined
  status: React.ReactNode
  roomDetail: IGetRoomResponse
  setRoomDetailLocal: (data: IGetRoomResponse) => void
  refresh?: () => void
  handleRedirectSearch: (e: any) => void
}

const MessageMenu: React.FC<IProps> = ({
    open,
    cancel,
    avatar,
    name,
    status,
    roomDetail,
    setRoomDetailLocal,
    refresh,
    handleRedirectSearch,
}) => {
    const [isUpdateName, setIsUpdateName] = useState(false)
    const [isAddMembers, setIsAddMembers] = useState(false)
    const [valueSearch, setValueSearch] = useState<string>('')
    const [mediaActivedKey, setMediaActivedKey] = useState<
        `${TypeFileStorage}` | null
    >(null)

    const [officialMessages, setOfficialMessages] = useState<IMessage[]>([])
    const [params, setParams] = useState<IGetMessagesKeyWordRequest>({
        limit: 20,
        lastRecord: '',
        keyword: '',
    })
    const handleUpdateName = () => {
        setIsUpdateName(true)
    }

    const handleAddmembers = () => {
        setIsAddMembers(true)
    }
    const {
        data: rawMessages,
        refetch: refetchRawMessages,
        isLoading: searchMsgLoading,
    } = useQuery(
        [ENDPOINT.MESSAGE.GET_MESSAGES, params.keyword],
        () => MessageService.getMessages({ id: roomDetail._id, params }),
        {
        enabled: params.keyword !== '',
        onSuccess: (response: any) => {
            const result = response?.data?.data
            if (!result?.length) {
            setParams({
                ...params,
                lastRecord: '',
            })
            }
            !params.lastRecord
            ? setOfficialMessages([...result?.reverse()])
            : setOfficialMessages([...officialMessages, ...result?.reverse()])
            setParams({
            ...params,
            lastRecord: JSON.stringify(response?.data?.lastRecord),
            })
        },
        },
    )
    const handleSearchMessages = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValueSearch(e.target.value)
        const searchText = e.target.value;
        if (searchText === '') {
        setOfficialMessages([]);
        setParams({
            ...params,
            lastRecord: '',
        });
        } else {
        setParams({
            ...params,
            lastRecord: '',
            keyword: JSON.stringify(searchText),
        });
        }
    }
    const items: CollapseProps['items'] = useMemo(() => {
        if (!roomDetail?._id) return []
        let temp: CollapseProps['items'] = [
            {
                key: '3',
                label: 'Media files, files and links',
                children: (
                <div className='list-button'>
                    <Button onClick={() => setMediaActivedKey(TypeFileStorage.IMAGE)}>
                    <FileGifOutlined />
                    <span>Media files</span>
                    </Button>
                    <Button onClick={() => setMediaActivedKey(TypeFileStorage.DOC)}>
                    <FileTextOutlined />
                    <span>Files</span>
                    </Button>
                    <Button onClick={() => setMediaActivedKey(TypeFileStorage.LINK)}>
                    <LinkOutlined />
                    <span>Links</span>
                    </Button>
                </div>
                ),
            }
        ]
        if (roomDetail?.isGroup) {
        temp = [
            {
                key: '1',
                label: 'Customize chat',
                children: (
                    <div className='list-button'>
                    <Button onClick={handleUpdateName}>
                        <EditOutlined />
                        <span>Rename the chat</span>
                    </Button>
                    <UploadAvatar
                        roomDetail={roomDetail}
                        setRoomDetailLocal={setRoomDetailLocal}
                    />
                    </div>
                ),
            },
            {
                key: '2',
                label: 'Member in the chat',
                children: (
                    <div className='list-button'>
                    {roomDetail?.participants?.map((participant: any) => (
                        <div className='list-member' key={participant._id}>
                        <AvatarWrap
                            size={42}
                            src={participant.avatar}
                            isOnline={participant.isOnline}
                        />
                        {participant.name}
                        </div>
                    ))}
                    <Button onClick={handleAddmembers}>
                        <UserAddOutlined />
                        <span>Add members</span>
                    </Button>
                    </div>
                ),
            },
            {
                key: '3',
                label: 'Media files, files and links',
                children: (
                    <div className='list-button'>
                    <Button onClick={() => setMediaActivedKey(TypeFileStorage.IMAGE)}>
                        <FileGifOutlined />
                        <span>Media files</span>
                    </Button>
                    <Button onClick={() => setMediaActivedKey(TypeFileStorage.DOC)}>
                        <FileTextOutlined />
                        <span>Files</span>
                    </Button>
                    <Button onClick={() => setMediaActivedKey(TypeFileStorage.LINK)}>
                        <LinkOutlined />
                        <span>Links</span>
                    </Button>
                    </div>
                ),
            },
            {
                key: '4',
                label: 'Privacy & Support',
                children: (
                    <div className='list-button'>
                    <Button>
                        <LogoutOutlined />
                        <span>Leave the group</span>
                    </Button>
                    </div>
                ),
            },
        ]
        }

        return temp
    }, [roomDetail, setRoomDetailLocal])

    const handleOkNewRoomModal = () => {
        setIsUpdateName(false)
        setIsAddMembers(false)
    }

    const handleCancelNewRoomModal = () => {
        setIsUpdateName(false)
        setIsAddMembers(false)
    }

    const renderMessages = () => {
        return officialMessages.map((messageGroup, indexGroup) => {
        return (
            <div
            key={`mgs_${indexGroup}`}
            onClick={() => handleRedirectSearch(messageGroup)}
            >
            {roomDetail?.participants?.map((participant: any) => (
                <div key={participant._id}>
                {messageGroup.userId === participant._id && (
                    <div>
                    <div
                        style={{
                        display: 'flex',
                        gap: '10px',
                        }}
                    >
                        <div className='list-member'>
                        <AvatarWrap size={42} src={participant.avatar} />
                        </div>
                        <div
                        style={{
                            width: '100%',
                        }}
                        >
                        <div
                            style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            }}
                        >
                            <div>{participant.name}</div>
                            <div>
                            {moment(messageGroup.createdAt).format('lll')}
                            </div>
                        </div>
                        <div>{messageGroup.content}</div>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>
        )
        })
    }

    return (
        <Drawer
        placement='right'
        closeIcon={false}
        onClose={cancel}
        open={open}
        className='c-message-menu'
        >
        {!mediaActivedKey ? (
            <>
            <div className='c-message-menu__header'>
                {avatar}
                <h3>{name}</h3>
                <p>{status}</p>
                <div className='c-message-menu__header__search'>
                <Input
                    value={valueSearch}
                    onChange={handleSearchMessages}
                    placeholder='Search'
                    prefix={<SearchOutlined />}
                />
                </div>
                {officialMessages.length > 0 && (
                <div
                    className='content'
                    id='scrollableDiv'
                    style={{
                    overflow: 'auto',
                    width: '100%',
                    }}
                >
                    <InfiniteScroll
                    dataLength={Number(rawMessages?.data.data.length) || 0}
                    hasMore={rawMessages?.data?.lastRecord !== ''}
                    height='auto'
                    next={refetchRawMessages}
                    loader={searchMsgLoading && <h4>Loading...</h4>}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '0 10px',
                        marginTop: '10px',
                        maxHeight: '500px',
                    }}
                    scrollableTarget='scrollableDiv'
                    >
                    {renderMessages()}
                    </InfiniteScroll>
                </div>
                )}
            </div>
            <div className='c-message-menu__content'>
                <Collapse items={items} bordered={false} expandIconPosition='end' />
            </div>
            {(isUpdateName || isAddMembers) && <ModalNewRoom
                open={isUpdateName || isAddMembers}
                onCancel={handleCancelNewRoomModal}
                onOk={handleOkNewRoomModal}
                isUpdateName={isUpdateName}
                isUpdateMember={isAddMembers}
                setRoomDetailLocal={setRoomDetailLocal}
                roomDetail={roomDetail}
                refresh={refresh}
            />}
            </>
        ) : (
            <MediaContainer
            activeKey={mediaActivedKey}
            list={roomDetail.fileStorages}
            onChangeKey={setMediaActivedKey}
            />
        )}
        </Drawer>
    )
}

export default MessageMenu
