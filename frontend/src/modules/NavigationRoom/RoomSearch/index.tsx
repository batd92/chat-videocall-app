import { AvatarGroupWrap, AvatarWrap, SpinWrap } from '@/components/commons';
import { RoomService } from '@/services';
import { ENDPOINT } from '@/services/endpoint';
import { IGetRoomsRequest } from '@/interface/request';
import { Input } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useQuery } from 'react-query';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import './style.scss';
import { debounce } from 'lodash';
import { IParticipant } from '@/interface/response';
import { useAuth } from '@/providers/auth';
import { getImage, trunMessage } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import { APP_ROUTER } from '@/utils/constants/router';
import { IRoomDetail } from '@/interface/common';
import { IMAGE_TYPE } from '@/utils/constants';

interface IProps {
  setIsSearch: (isSearch: boolean) => void;
}

export const RoomSearch = ({ setIsSearch }: IProps) => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const searchInputRef = useRef<any>(null);
    const [rooms, setRooms] = useState<any>([]);
    const [params, setParams] = useState<IGetRoomsRequest>({
        limit: 12,
        lastRecord: '',
    });

    useEffect(() => {
        if (searchInputRef?.current) {
        searchInputRef.current.focus();
        }
    }, [searchInputRef]);

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
                ? [...rooms, ...response?.rooms]
                : [...response?.rooms],
            );
            setParams({
            ...params,
            lastRecord: JSON.stringify(response?.data?.lastRecord),
            });
        },
        },
    );

    /**
     * Function to handle search content change
     * @param e
     */
    const onHandleSearch = (e: any) => {
        console.log(e.target.value);
        debouncedSearch(e.target.value);
    };

    
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
    );

    /**
     * Select one room
     * @param room 
     * @returns 
     */
    const onRoomChoose = (room: IRoomDetail) => {
        if (!room?.id) return;
        setIsSearch(false);
        router.push(APP_ROUTER.MESSAGE.CHAT_DETAIL.replace(':id', room?.id));
    };

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
                {rooms?.map((room: IRoomDetail, index: number) => {
                    const currentFriend = room.participants?.filter((person: any) => {
                        return person && person._id !== currentUser?._id;
                    });
                    return (
                        <div
                        key={room?.id || index}
                        className='room-item'
                        onClick={() => onRoomChoose(room)}
                        >
                        <div className='avatar'>
                            {room.isGroup && !room?.avatarUrl ? (
                            <AvatarGroupWrap
                                users={room?.participants}
                                isOnline={room?.hasOnline}
                            />
                            ) : (
                            <AvatarWrap
                                size={48}
                                src={
                                room?.avatarUrl ||
                                getImage(
                                    currentFriend?.[0]?.avatarUrl!,
                                    IMAGE_TYPE.AVATAR,
                                )
                                }
                                isOnline={room?.hasOnline}
                            />
                            )}
                        </div>
                        <div className='name'>
                            {room?.name
                            ? trunMessage(room?.name, 26)
                            : trunMessage(currentFriend[0].name, 26)}
                        </div>
                        </div>
                    );
                })}
            </InfiniteScroll>
            </div>
        </SpinWrap>
        </>
    );
};
