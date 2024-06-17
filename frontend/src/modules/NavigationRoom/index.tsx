'use client'
import { SpinWrap } from '@/components/commons'
import { PlusIcon } from '@/components/icons'
import { RoomService } from '@/services'
import { ENDPOINT } from '@/services/endpoint'
import { IGetRoomsRequest } from '@/interface/request'
import { SearchOutlined } from '@ant-design/icons'
import { Input, InputRef, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'
import { RoomItem } from '../NavigationRoom/RoomItem'
import AccountDropdown from '../Accounts'
import CreateRoom from '../Room/ModalRoom/CreateRoom'
import './style.scss'
import { RoomSearch } from './RoomSearch'

export const NavigationRoom = () => {
    const [isOpenCreateRoom, setIsOpenCreateRoom] = useState(false)
    const [rooms, setRooms] = useState<any>([])
    const [isSearch, setIsSearch] = useState(false)
    const searchRef = useRef<any>(null)
    const [params, setParams] = useState<IGetRoomsRequest>({
        limit: 12,
        lastRecord: '',
    })

    const {
        data: roomList,
        refetch: refetchRoom,
        isFetching: isFetching,
    } = useQuery(
        [ENDPOINT.ROOM.GET_ROOMS, params?.keyword],
        () => RoomService.getRooms(params),
        {
        onSuccess: (response: any) => {
            setRooms([...rooms, ...response?.rooms])
            setParams({
            ...params,
            lastRecord: JSON.stringify(response?.lastRecord || ''),
            })
        },
        },
    )

    const handleNewRoomClick = () => {
        setIsOpenCreateRoom(true)
        setIsSearch(false)
    }

    const handleOkNewRoomModal = (result: any) => {
        if (result) {
            setRooms([result?.data, ...rooms])
        }
        setIsOpenCreateRoom(false)
    }

    useEffect(() => {
        if (typeof document === 'undefined' || !searchRef) return
        const isActive = document.activeElement === searchRef?.current
        setIsSearch(isActive)
    }, [searchRef])

    return (
        <div className='c-room-list'>
        <div className='header'>
            <div className='page-title'>Messages</div>
            <div className='actions'>
            <Tooltip title='New chat'>
                <div className='new-chat' onClick={handleNewRoomClick}>
                    <PlusIcon />
                </div>
            </Tooltip>
            <AccountDropdown />
            </div>
        </div>
        {isSearch ? (
            <RoomSearch setIsSearch={setIsSearch} />
        ) : (
            <>
            <div className='search-msg'>
                <Input
                className='search-msg-inner'
                placeholder='Search'
                prefix={<SearchOutlined />}
                onClick={() => setIsSearch(true)}
                ref={searchRef!}
                />
            </div>
            <SpinWrap spinning={isFetching}>
                <div className='list-msg'>
                <InfiniteScroll
                    dataLength={Number(rooms?.length) || 0}
                    hasMore={roomList?.data?.lastRecord !== ''}
                    height={797}
                    next={refetchRoom}
                    loader={<h4>Loading...</h4>}
                >
                    {rooms?.map((room: any, index: any) => (
                        <RoomItem
                            key={room?._id || index}
                            room={room}
                        />
                    ))}
                </InfiniteScroll>
                </div>
            </SpinWrap>
            </>
        )}
        <CreateRoom
            open={isOpenCreateRoom}
            onCancel={() => setIsOpenCreateRoom(false)}
            onOk={handleOkNewRoomModal}
        />
        </div>
    )
}
