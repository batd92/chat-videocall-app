import React, { useState, useMemo, useCallback } from 'react'
import { Button, Collapse, CollapseProps, Drawer } from 'antd'
import { EditOutlined, LogoutOutlined } from '@ant-design/icons'
import UpdateRoom from '../Room/ModalRoom/UpdateRoom'
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
import { IGetMessagesResponse } from '@/interface/response/message/index'

interface IProps {
    open: boolean
    cancel: () => void
    avatarUrl: React.ReactNode
    name: string | undefined
    status: React.ReactNode
    roomDetail: IGetRoomResponse
    setRoomCurrentSelected: (data: IGetRoomResponse) => void
    refresh?: () => void
    handleRedirectSearch: (e: any) => void
}

const SidebarMenu: React.FC<IProps> = ({
    open,
    cancel,
    avatarUrl,
    name,
    status,
    roomDetail,
    setRoomCurrentSelected,
    handleRedirectSearch,
}) => {
    console.log('SidebarMenu ....')
    const [isOpenModel, setIsOpenModel] = useState(false)
    const [valueSearch, setValueSearch] = useState<string>('')
    const [mediaActivedKey, setMediaActivedKey] = useState<TypeFileStorage | null>(null);
    const [officialMessages, setOfficialMessages] = useState<IGetMessagesResponse[]>([])
    const [params, setParams] = useState<IGetMessagesKeyWordRequest>({
        limit: 20,
        lastRecord: '',
        keyword: '',
    })

    const handleUpdateName = useCallback(() => {
        setIsOpenModel(true)
    }, [])

    const handleAddmembers = useCallback(() => {
        setIsOpenModel(true)
    }, [])

    const handleSearchMessages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValueSearch(e.target.value)
        const searchText = e.target.value
        if (searchText === '') {
            setOfficialMessages([])
            setParams((prev: any) => ({ ...prev, lastRecord: '' }))
        } else {
            setParams((prev: any) => ({ ...prev, lastRecord: '', keyword: JSON.stringify(searchText) }))
        }
    }, [])

    const { data: rawMessages, refetch: refetchRawMessages, isLoading: searchMsgLoading } = useQuery(
        [ENDPOINT.MESSAGE.GET_MESSAGES, params.keyword],
        () => MessageService.getMessages({ id: roomDetail._id, params }),
        {
            enabled: params.keyword !== '',
            onSuccess: (response: any) => {
                const result = response?.data;
                if (!result?.length) {
                    setParams((prev: any) => ({ ...prev, lastRecord: '' }))
                }
                setOfficialMessages((prev) =>
                    !params.lastRecord ? [...result.reverse()] : [...prev, ...result.reverse()]
                )
                setParams((prev: any) => ({ ...prev, lastRecord: JSON.stringify(response?.data?.lastRecord) }))
            },
        }
    )

    const handleMediaClick = useCallback((key: TypeFileStorage) => {
        setMediaActivedKey(key);
    }, []);

    const collapseItems: CollapseProps['items'] = useMemo(() => {
        if (!roomDetail?._id) return []
        const collapseItems: CollapseProps['items'] = [
            {
                key: '3',
                label: 'Media files, files and links',
                children: <MediaButtons onMediaClick={handleMediaClick} />,
            }
        ]
        if (roomDetail?.isGroup) {
            collapseItems.unshift(
                {
                    key: '1',
                    label: 'Customize chat',
                    children: (
                        <div className='list-button'>
                            <Button onClick={handleUpdateName}>
                                <EditOutlined />
                                <span>Rename the chat</span>
                            </Button>
                            <UploadAvatar roomDetail={roomDetail} setRoomCurrentSelected={setRoomCurrentSelected} />
                        </div>
                    ),
                },
                {
                    key: '2',
                    label: 'Member in the chat',
                    children: <MemberList participants={roomDetail.participants} onAddMemberClick={handleAddmembers} />,
                }
            )
        }
        collapseItems.push(
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
        return collapseItems
    }, [roomDetail, handleUpdateName, handleAddmembers, handleMediaClick])

    const handleOkNewRoomModal = useCallback(() => {
        setIsOpenModel(false)
    }, [])

    const handleCancelNewRoomModal = useCallback(() => {
        setIsOpenModel(false)
    }, [])

    return (
        <Drawer placement='right' closeIcon={false} onClose={cancel} open={open} className='c-message-menu'>
            {!mediaActivedKey ? (
                <>
                    <div className='c-message-menu__header'>
                        {avatarUrl}
                        <h3>Name: {name}</h3>
                        <br></br>
                        <div className='c-message-menu__header__search'>
                            <br></br>
                            <SearchInput value={valueSearch} onChange={handleSearchMessages} />
                        </div>
                        <br></br>
                        { (valueSearch && valueSearch.length > 0) && (
                            <MessageList
                                messages={officialMessages}
                                onMessageClick={handleRedirectSearch}
                                hasMore={rawMessages?.data?.lastRecord !== ''}
                                loadMore={refetchRawMessages}
                                isLoading={searchMsgLoading}
                                keyword={valueSearch}
                            />
                        )}
                    </div>
                    <div className='c-message-menu__content'>
                        <Collapse items={collapseItems} bordered={false} expandIconPosition='end' />
                    </div>
                    {
                        <UpdateRoom
                            open={isOpenModel}
                            roomDetail={roomDetail}
                            onOk={handleOkNewRoomModal}
                            onCancel={handleCancelNewRoomModal}
                            setRoomCurrentSelected={setRoomCurrentSelected}
                        />
                    }
                </>
            ) : (
                <MediaContainer mediaKey={mediaActivedKey} onBack={() => setMediaActivedKey(null)} roomId={roomDetail._id} />
            )}
        </Drawer>
    )
}

export default React.memo(SidebarMenu)
