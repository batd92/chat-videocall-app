import React, { useState, useMemo, useCallback } from 'react'
import { Button, Collapse, CollapseProps, Drawer } from 'antd'
import { EditOutlined, LogoutOutlined } from '@ant-design/icons'
import ModalNewRoom from '../Room/ModalRoom/CreateRoom'
import { IGetRoomResponse, TypeFileStorage } from '@/interface/response'
import { useQuery } from 'react-query'
import { MessageService } from '@/services'
import { IGetMessagesKeyWordRequest } from '@/interface/request'
import { ENDPOINT } from '@/services/endpoint'
import MessageList from './MessageList'
import MediaButtons from './MediaButtons'
import MemberList from './MemberList'
import SearchInput from './SearchInput'
import UploadAvatar from './UploadAvatar'
import MediaContainer from './MediaContainer'
import { IMessage } from '@/interface/common'

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

const SidebarMenu: React.FC<IProps> = ({
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
    const [mediaActivedKey, setMediaActivedKey] = useState<TypeFileStorage | null>(null);
    const [officialMessages, setOfficialMessages] = useState<IMessage[]>([])
    const [params, setParams] = useState<IGetMessagesKeyWordRequest>({
        limit: 20,
        lastRecord: '',
        keyword: '',
    })

    const handleUpdateName = useCallback(() => {
        setIsUpdateName(true)
    }, [])

    const handleAddmembers = useCallback(() => {
        setIsAddMembers(true)
    }, [])

    const handleSearchMessages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValueSearch(e.target.value)
        const searchText = e.target.value
        if (searchText === '') {
            setOfficialMessages([])
            setParams((prev) => ({ ...prev, lastRecord: '' }))
        } else {
            setParams((prev) => ({ ...prev, lastRecord: '', keyword: JSON.stringify(searchText) }))
        }
    }, [])

    const { data: rawMessages, refetch: refetchRawMessages, isLoading: searchMsgLoading } = useQuery(
        [ENDPOINT.MESSAGE.GET_MESSAGES, params.keyword],
        () => MessageService.getMessages({ id: roomDetail._id, params }),
        {
            enabled: params.keyword !== '',
            onSuccess: (response: any) => {
                const result = response?.data?.data
                if (!result?.length) {
                    setParams((prev) => ({ ...prev, lastRecord: '' }))
                }
                setOfficialMessages((prev) =>
                    !params.lastRecord ? [...result.reverse()] : [...prev, ...result.reverse()]
                )
                setParams((prev) => ({ ...prev, lastRecord: JSON.stringify(response?.data?.lastRecord) }))
            },
        }
    )

    const items: CollapseProps['items'] = useMemo(() => {
        if (!roomDetail?._id) return []
        const temp: CollapseProps['items'] = [
            {
                key: '3',
                label: 'Media files, files and links',
                children: <MediaButtons onMediaClick={setMediaActivedKey} />,
            }
        ]
        if (roomDetail?.isGroup) {
            temp.unshift(
                {
                    key: '1',
                    label: 'Customize chat',
                    children: (
                        <div className='list-button'>
                            <Button onClick={handleUpdateName}>
                                <EditOutlined />
                                <span>Rename the chat</span>
                            </Button>
                            <UploadAvatar roomDetail={roomDetail} setRoomDetailLocal={setRoomDetailLocal} />
                        </div>
                    ),
                },
                {
                    key: '2',
                    label: 'Member in the chat',
                    children: <MemberList participants={roomDetail.participants} onAddMemberClick={handleAddmembers} />,
                },
                {
                    key: '4',
                    label: 'Leave room',
                    children: (
                        <div className='list-button'>
                            <Button>
                                <LogoutOutlined />
                                <span>Leave the group</span>
                            </Button>
                        </div>
                    ),
                }
            )
        }
        return temp
    }, [roomDetail, setRoomDetailLocal, handleUpdateName, handleAddmembers])

    const handleOkNewRoomModal = useCallback(() => {
        setIsUpdateName(false)
        setIsAddMembers(false)
    }, [])

    const handleCancelNewRoomModal = useCallback(() => {
        setIsUpdateName(false)
        setIsAddMembers(false)
    }, [])

    return (
        <Drawer placement='right' closeIcon={false} onClose={cancel} open={open} className='c-message-menu'>
            {!mediaActivedKey ? (
                <>
                    <div className='c-message-menu__header'>
                        {avatar}
                        <h3>{name}</h3>
                        <p>{status}</p>
                        <div className='c-message-menu__header__search'>
                            <SearchInput value={valueSearch} onChange={handleSearchMessages} />
                        </div>
                        {officialMessages.length > 0 && (
                            <MessageList
                                messages={officialMessages}
                                participants={roomDetail.participants}
                                onMessageClick={handleRedirectSearch}
                                hasMore={rawMessages?.data?.lastRecord !== ''}
                                loadMore={refetchRawMessages}
                                isLoading={searchMsgLoading}
                            />
                        )}
                    </div>
                    <div className='c-message-menu__content'>
                        <Collapse items={items} bordered={false} expandIconPosition='end' />
                    </div>
                    {(isUpdateName || isAddMembers) && (
                        <ModalNewRoom
                            open={isUpdateName || isAddMembers}
                            onOk={handleOkNewRoomModal}
                            onCancel={handleCancelNewRoomModal}
                        />
                    )}
                </>
            ) : (
                <MediaContainer mediaKey={mediaActivedKey} onBack={() => setMediaActivedKey(null)} list={[]} />
            )}
        </Drawer>
    )
}

export default React.memo(SidebarMenu)
