import { RoomService } from "@/services"
import { IGetRoomResponse } from "@/types/response"
import { notificationMessage } from "@/utils/helpers"
import { PictureOutlined } from "@ant-design/icons"
import { Button, Upload } from "antd"
import { RcFile, UploadChangeParam } from "antd/es/upload"
import React, { useState } from "react"
import { useMutation } from "react-query"

interface IProps {
    roomDetail: IGetRoomResponse
    setRoomDetailLocal: (data: IGetRoomResponse) => void
}

const UploadAvatar = ({
    roomDetail,
    setRoomDetailLocal,
}: IProps) => {
    const [isError, setIsError] = useState<boolean>(false)

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJpgOrPng) {
            notificationMessage({
                type: 'error',
                message: 'You can only upload JPG/PNG file!',
            })
            setIsError(true)
        }
        const isLt2M = file.size / 1024 / 1024 < 5
        if (!isLt2M) {
            notificationMessage({
                type: 'error',
                message: 'Image must smaller than 5MB!',
            })
            setIsError(true)
        }
        return isJpgOrPng && isLt2M
    }

    const { mutateAsync: uploadAvatar } = useMutation(['upload-room-photo'],
        (file: any) => RoomService.updateRoomAvatar(roomDetail?._id, { file }),
        {
            onSuccess: (response: any) => {
                if (!response) return
                setRoomDetailLocal({
                    ...roomDetail,
                    avatar: response?.data?.path,
                })
            },
            onError: (error: any) => {
                notificationMessage({
                    message: error.message,
                    type: 'error',
                })
            },
        },
    )

    const handleChangeFile = (fileInfo: UploadChangeParam) => {
        if (isError) {
            return setIsError(false)
        }

        if (fileInfo.file.status !== 'removed') {
            uploadAvatar(fileInfo.file?.originFileObj || fileInfo.file)
        }
    }

    return (
        <Upload
            showUploadList={false}
            onChange={handleChangeFile}
            beforeUpload={beforeUpload}
            className='button-upload'
            accept="image/*"
            fileList={[]}
        >
            <Button>
                <PictureOutlined />
                <span>Change chat group photo</span>
            </Button>
        </Upload>
    )
}

export default React.memo(UploadAvatar)
