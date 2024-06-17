import { RoomService } from '@/services/room'
import { UserService } from '@/services/user'
import { IGetRoomResponse } from '@/interface/response'
import { getRoomName, notificationMessage } from '@/utils/helpers'
import { Form, Input, Modal, Select, Avatar } from 'antd'
import { useForm } from 'antd/es/form/Form'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

interface IProps {
    open: boolean
    onCancel: () => void
    onOk: (result?: any) => void
    roomDetail?: IGetRoomResponse
    setRoomCurrentSelected: Function
    refresh?: () => void
}

const UpdateRoom: React.FC<IProps> = ({
    open,
    onCancel,
    onOk,
    roomDetail,
    setRoomCurrentSelected,
}) => {
    const [users, setUsers] = useState<any[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [roomName, setRoomName] = useState<string>(roomDetail?.name || '')
    const [form] = useForm()

    useQuery('users', UserService.getUsers, {
        enabled: open,
        onSuccess: (data: any) => {
            setUsers(data?.users || [])
        },
    })
    const { mutate: mutateUpdateRoom, isLoading } =
        useMutation(
        () => {
            return RoomService.updateRoomName(roomDetail?._id || '', {
                name: roomName || getRoomName(users, selectedMembers),
                userIds: selectedMembers,
            })
        },
        {
            onSuccess: (response: any) => {
                onOk(response)
                setRoomCurrentSelected(response?.room)
                onCancel()
                form.resetFields()
                setRoomName('')
            },
            onError: (error: any) => {
                notificationMessage({
                    message: error.message,
                    type: 'error',
                })
            }
        },
        )

    const handleMemberSelectChange = (selected: string[]) => {
        setSelectedMembers(selected)
    }

    const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value)
    }

    const filterFriends = (input: string, option: any) => {
        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    const onSubmit = () => {
        if (!roomDetail?._id) {
        return
        }
        mutateUpdateRoom()
    }

    const handleCancel = () => {
        setRoomName('')
        onCancel()
    }

    return (
        <>
        <Modal
            title={'Update Name Room'}
            open={open}
            onCancel={handleCancel}
            onOk={onSubmit}
            confirmLoading={isLoading}
        >
            <Form form={form} layout='vertical' name='basic' autoComplete='off'>
            {
                <Form.Item label='Room Name' name='roomName' initialValue={roomName}>
                <Input value={roomName} onChange={handleRoomNameChange} />
                </Form.Item>}
            {
                <Form.Item label='Members' name='members'>
                <Select
                    mode='multiple'
                    onChange={handleMemberSelectChange}
                    value={selectedMembers}
                    showSearch
                    filterOption={filterFriends}
                >
                    {_.differenceBy(users || [], roomDetail?.participants || [], '_id').map((user: any, index: number) => (
                        <Select.Option key={user._id || index} value={user._id}>
                            <Avatar src={user.avatarUrl} />
                            &nbsp;&nbsp;{user.firstName} {user.lastName}
                        </Select.Option>
                    ))}
                </Select>
                </Form.Item>}
            </Form>
        </Modal>
        </>
    )
}

export default UpdateRoom
