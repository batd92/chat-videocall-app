'use client'
import { SpinWrap } from '@/components/commons'
import { PlusIcon } from '@/components/icons'
import { useSocket } from '@/providers/Socket'
import { RoomService } from '@/services'
import { ENDPOINT } from '@/services/endpoint'
import { IGetRoomsRequest } from '@/types/request'
import { ESocketEvent } from '@/utils/constants'
import { SearchOutlined } from '@ant-design/icons'
import { Input, InputRef, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'
import { MessageItem } from '..'
import AccountDropdown from '../AccountDropdown'
import ModalNewRoom from '../ModalRoom/CreateRoom'
import './style.scss'
import { RoomSearch } from './RoomSearch'

export const RoomList = () => {
  const { lastMessage } = useSocket()
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

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data)
      const { event, payload } = data

      switch (event) {
        case ESocketEvent.SEND_MESSAGE:
            const result = rooms.filter((e: any) => e._id != payload?.conversation._id)
            result.unshift(payload?.conversation)
            setRooms(result)
            break
        case ESocketEvent.REMOVE_MESSAGE:
            const results = rooms?.map((room: any) => {
                if (room?._id === payload?.conversationId) {
                    return {
                        ...room,
                        lastMessage: {
                        ...room.lastMessage,
                        deletedAt: payload?.message?.deletedAt,
                        },
                    }
                }
                return room
            })
            setRooms(results)
            break
        default:
            console.log(event, payload)
            break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])

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
                {rooms?.map((conv: any) => (
                  <MessageItem
                    key={conv?._id}
                    data={conv}
                    rooms={rooms}
                    setRooms={setRooms}
                  />
                ))}
              </InfiniteScroll>
            </div>
          </SpinWrap>
        </>
      )}
      <ModalNewRoom
        open={isOpenCreateRoom}
        onCancel={() => setIsOpenCreateRoom(false)}
        onOk={handleOkNewRoomModal}
      />
    </div>
  )
}
