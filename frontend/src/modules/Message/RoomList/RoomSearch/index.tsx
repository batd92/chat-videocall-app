import { AvatarGroupWrap, AvatarWrap, SpinWrap } from '@/components/commons'
import { RoomService } from '@/services'
import { ENDPOINT } from '@/services/endpoint'
import { IGetRoomsRequest } from '@/types/request'
import { Input } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'
import './style.scss'
import { debounce } from 'lodash'
import { IParticipant } from '@/types/response'
import { useAuth } from '@/providers/Auth'
import { getImage, truncateString } from '@/utils/helpers'
import { useRouter } from 'next/navigation'
import { APP_ROUTER } from '@/utils/constants/router'
import { IRoomDetail } from '@/types/common'
import { IMAGE_TYPE } from '@/utils/constants'

interface IProps {
  setIsSearch: (isSearch: boolean) => void
}

export const RoomSearch = ({ setIsSearch }: IProps) => {
  const { currentUser } = useAuth()
  const router = useRouter()
  const searchInputRef = useRef<any>(null)
  const [rooms, setRooms] = useState<any>([])
  const [params, setParams] = useState<IGetRoomsRequest>({
    limit: 12,
    lastRecord: '',
  })

  useEffect(() => {
    if (searchInputRef?.current) {
      searchInputRef.current.focus()
    }
  }, [searchInputRef])

  const {
    data: roomList,
    refetch: refetchRoom,
    isFetching: isFetching,
  } = useQuery(
    [ENDPOINT.ROOM.GET_ROOMS, params?.keyword],
    () => RoomService.getRooms(params),
    {
      onSuccess: (response: any) => {
        setRooms(
          params.lastRecord
            ? [...rooms, ...response?.data?.data]
            : [...response?.data?.data],
        )
        setParams({
          ...params,
          lastRecord: JSON.stringify(response?.data?.lastRecord),
        })
      },
    },
  )

  const onHandleSearch = (e: any) => {
    console.log(e.target.value)
    debouncedSearch(e.target.value)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(
      (nextValue) =>
        setParams((prev: any) => ({
          ...prev,
          keyword: JSON.stringify(nextValue),
          lastRecord: '',
        })),
      500,
    ),
    [],
  )

  const currentFriend = rooms?.participants?.filter(
    (person: IParticipant) => person._id !== currentUser?._id,
  )

  const onRoomChoose = (room: IRoomDetail) => {
    if (!room?._id) return
    setIsSearch(false)
    router.push(APP_ROUTER.MESSAGE.CHAT_DETAIL.replace(':id', room?._id))
  }

  return (
    <>
      <div className='search-msg-active'>
        <div
          className='search-msg-active__back'
          onClick={() => setIsSearch(false)}
        >
          <ArrowLeftOutlined />
        </div>
        <Input
          ref={searchInputRef}
          className='search-msg-inner'
          placeholder='Search'
          prefix={<SearchOutlined />}
          onChange={onHandleSearch}
          allowClear
        />
      </div>
      <SpinWrap spinning={isFetching}>
        <div className='list-msg'>
          <InfiniteScroll
            dataLength={Number(rooms?.length) || 0}
            hasMore={roomList?.data?.lastRecord !== null}
            height={797}
            next={refetchRoom}
            loader={isFetching ? <h4>Loading...</h4> : <></>}
          >
            {rooms?.map((room: IRoomDetail) => {
              const currentFriend = room?.participants?.filter(
                (person: IParticipant) => person._id !== currentUser?._id,
              )
              return (
                <div
                  key={room?._id}
                  className='room-item'
                  onClick={() => onRoomChoose(room)}
                >
                  <div className='avatar'>
                    {room.isGroup && !room?.avatar ? (
                      <AvatarGroupWrap
                        users={room?.participants}
                        isOnline={room?.hasOnline}
                      />
                    ) : (
                      <AvatarWrap
                        size={48}
                        src={
                          room?.avatar ||
                          getImage(
                            currentFriend?.[0]?.avatar!,
                            IMAGE_TYPE.AVATAR,
                          )
                        }
                        isOnline={room?.hasOnline}
                      />
                    )}
                  </div>
                  <div className='name'>
                    {room?.name
                      ? truncateString(room?.name, 26)
                      : truncateString(currentFriend[0].name, 26)}
                  </div>
                </div>
              )
            })}
          </InfiniteScroll>
        </div>
      </SpinWrap>
    </>
  )
}
