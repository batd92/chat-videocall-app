import { RoomService } from '@/services/room'
import { UserService } from '@/services/user'
import { getRoomName } from '@/utils/helpers'
import { Form, Input, Modal, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

interface IProps {
  open: boolean
  onCancel: () => void
  onOk: (result?: any) => void
  isUpdate: boolean
  isAddMember: boolean
  conversationDetail?: any
  refresh?: () => void
}

const CreateNewRoom: React.FC<IProps> = ({
  open,
  onCancel,
  onOk,
  isUpdate,
  isAddMember,
  conversationDetail,
  refresh,
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
        if (!roomName && isUpdate) {
          roomToSend = getRoomName(friends, selectedMembers)
        }
        if (conversationDetail?._id) {
          const result = await RoomService.invitesToRoom({
            conversationId: conversationDetail?._id,
            userIds: selectedMembers,
          })
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
        title={isUpdate ? 'Create New Room' : 'Update Name Room'}
        visible={open}
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
                filterOption={filterFriends}
              >
                {friends.map((friend: any) => (
                  <Select.Option key={friend._id} value={friend._id}>
                    {friend.name}
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
