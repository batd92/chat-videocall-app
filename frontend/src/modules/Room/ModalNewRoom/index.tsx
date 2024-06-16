import { RoomService } from '@/services/room'
import { UserService } from '@/services/user'
import { getRoomName } from '@/utils/helpers'
import { Form, Input, Modal, Select, Avatar } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

interface IProps {
    open: boolean
    onCancel: () => void
    onOk: (result?: any) => void
    isUpdate: boolean
    isAddMember: boolean
    roomDetail?: any
    refresh?: () => void
}

const CreateNewRoom: React.FC<IProps> = ({
    open,
    onCancel,
    onOk,
    isUpdate,
    isAddMember,
    roomDetail,
    refresh,
}) => {
    const [users, setUsers] = useState<any[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [roomName, setRoomName] = useState<string>('')
    const [form] = useForm()
    const { refetch } = useQuery('users', UserService.getUsers, {
        enabled: open,
        onSuccess: (data: any) => {
        setUsers(data?.data || [])
        },
    })
    const { mutate: mutateCreateRoom, isLoading: isLoadingCreateRoom } =
        useMutation(
        async () => {
            let roomToSend = roomName
            if (!roomName && isUpdate) {
                roomToSend = getRoomName(users, selectedMembers)
            }
            if (roomDetail?._id) {
            const result = await RoomService.invitesToRoom({ userIds: selectedMembers}, roomDetail?._id)
            if (refresh) {
                refresh()
            }
            return result
            }

            return RoomService.createRoom({
            name: roomToSend,
            userIds: selectedMembers,
            })
        },
        {
            onSuccess: (result: any) => {
            onOk(result)
            onCancel()
            form.resetFields()
            setRoomName('')
            },
        },
        )

    useEffect(() => {
        if (open) {
            refetch()
        }
    }, [open, refetch])

    const handleMemberSelectChange = (selected: string[]) => {
        setSelectedMembers(selected)
    }

    const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value)
    }

    const filterUsers = (input: string, option: any) => {
        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    return (
        <>
        <Modal
            title={isUpdate ? 'Create New Room' : 'Update Name Room'}
            open={open}
            onCancel={onCancel}
            onOk={() => mutateCreateRoom()}
        >
            <Form form={form} layout='vertical' name='basic' autoComplete='off'>
            {isAddMember && (
                <Form.Item label='Room Name' name='roomName'>
                <Input value={roomName} onChange={handleRoomNameChange} />
                </Form.Item>
            )}
            {isUpdate && (
                <Form.Item label='Members' name='members'>
                <Select
                    mode='multiple'
                    onChange={handleMemberSelectChange}
                    value={selectedMembers}
                    showSearch
                    filterOption={filterUsers}
                >
                    {users.map((user: any) => (
                    <Select.Option key={user._id} value={user._id}>
                        <Avatar src={user.avatar} />
                        &nbsp;&nbsp;{user.firstName + user.lastName}
                    </Select.Option>
                    ))}
                </Select>
                </Form.Item>
            )}
            </Form>
        </Modal>
        </>
    )
}

export default CreateNewRoom
