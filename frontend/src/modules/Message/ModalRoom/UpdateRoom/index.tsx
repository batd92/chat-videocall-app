import { RoomService } from '@/services/room'
import { UserService } from '@/services/user'
import { IGetRoomResponse } from '@/types/response'
import { TypeDataConversation } from '@/types/socket'
import { getRoomName, notificationMessage } from '@/utils/helpers'
import { Form, Input, Modal, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { error } from 'console'
import _ from 'lodash'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

interface IProps {
  open: boolean
  onCancel: () => void
  onOk: (result?: any) => void
  isUpdateName: boolean
  isUpdateMember: boolean
  conversationDetail?: IGetRoomResponse
  setRoomDetailLocal: any
  refresh?: () => void
}

const UpdateRoom: React.FC<IProps> = ({
  open,
  onCancel,
  onOk,
  isUpdateName,
  isUpdateMember,
  conversationDetail,
  setRoomDetailLocal,
}) => {
  const [friends, setFriends] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [roomName, setRoomName] = useState<string>(conversationDetail?.name || '')
  const [form] = useForm()
  useQuery('friends', UserService.getFriends, {
    enabled: open,
    onSuccess: (data) => {
      setFriends(data?.data || [])
    },
  })
  const { mutate: mutateUpdateRoom, isLoading } =
    useMutation(
       () => {
        let roomToSend = roomName
        if (!roomName && isUpdateName) {
          roomToSend = getRoomName(friends, selectedMembers)
        }
        if (isUpdateMember) {
          return RoomService.invitesToRoom({
            conversationId: conversationDetail?._id,
            userIds: selectedMembers,
          })
        }

        return RoomService.updateRoomName(conversationDetail?._id || '', {
          name: roomToSend,
        })
      },
      {
        onSuccess: (result) => {
          onOk(result)
          setRoomDetailLocal(result?.data)
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
    if (!conversationDetail?._id) {
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
        title={isUpdateName ? 'Update Name Room' : 'Add Members'}
        visible={open}
        onCancel={handleCancel}
        onOk={onSubmit}
        confirmLoading={isLoading}
      >
        <Form form={form} layout='vertical' name='basic' autoComplete='off'>
          {isUpdateName && (
            <Form.Item label='Room Name' name='roomName' initialValue={roomName}>
              <Input value={roomName} onChange={handleRoomNameChange} />
            </Form.Item>
          )}
          {isUpdateMember && (
            <Form.Item label='Members' name='members'>
              <Select
                mode='multiple'
                onChange={handleMemberSelectChange}
                value={selectedMembers}
                showSearch
                filterOption={filterFriends}
              >
                {_.xorBy(conversationDetail?.participants || [], [...friends], '_id').map((friend: any) => (
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

export default UpdateRoom
