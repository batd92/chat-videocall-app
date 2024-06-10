import { RoomService } from '@/services/room'
import { UserService } from '@/services/user'
import { getRoomName } from '@/utils/helpers'
import { Form, Input, Modal, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

interface IProps {
  open: boolean
  onCancel: () => void
  onOk: (result?: any) => void
  conversationDetail?: any
  refresh?: () => void
}

const CreateRoom: React.FC<IProps> = ({
  open,
  onCancel,
  onOk,
  conversationDetail,
}) => {
  const [friends, setFriends] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [roomName, setRoomName] = useState<string>('')
  const [form] = useForm()
  const { refetch } = useQuery('friends', UserService.getFriends, {
    enabled: open,
    onSuccess: (data) => {
      setFriends(data?.data || [])
    },
  })
  const { mutate: mutateCreateRoom, isLoading: isLoadingCreateRoom } =
    useMutation(
      async () => {
        let roomToSend = roomName
        if (!roomName) {
          roomToSend = getRoomName(friends, selectedMembers)
        }
        if (conversationDetail?._id) {
          const result = await RoomService.invitesToRoom({
            conversationId: conversationDetail?._id,
            userIds: selectedMembers,
          })
          return result
        }

        return RoomService.createRoom({
          name: roomToSend,
          userIds: selectedMembers,
        })
      },
      {
        onSuccess: (result) => {
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

  const filterFriends = (input: string, option: any) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }

  return (
    <>
      <Modal
        title='Create New Room'
        visible={open}
        onCancel={onCancel}
        onOk={() => mutateCreateRoom()}
        confirmLoading={isLoadingCreateRoom}
      >
        <Form form={form} layout='vertical' name='basic' autoComplete='off'>
          <Form.Item label='Room Name' name='roomName'>
            <Input value={roomName} onChange={handleRoomNameChange} />
          </Form.Item>
          <Form.Item label='Members' name='members'>
            <Select
              mode='multiple'
              onChange={handleMemberSelectChange}
              value={selectedMembers}
              showSearch
              filterOption={filterFriends}
            >
              {friends.map((friend: any) => (
                <Select.Option key={friend._id} value={friend._id}>
                  {friend.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CreateRoom
