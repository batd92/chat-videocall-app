import React, { useState } from "react"
import { useMutation } from "react-query"
import { Button, Upload } from "antd"
import { UploadChangeParam, RcFile } from "antd/es/upload"
import { PictureOutlined } from "@ant-design/icons"
import { RoomService } from "@/services"
import { IGetRoomResponse } from "@/interface/response"
import { notificationMessage } from "@/utils/helpers"

interface IProps {
    roomDetail: IGetRoomResponse
    setRoomDetailLocal: (data: IGetRoomResponse) => void
}

const IMAGE_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 5

const isValidFileType = (file: RcFile) => IMAGE_TYPES.includes(file.type)
const isValidFileSize = (file: RcFile) => file.size / 1024 / 1024 < MAX_SIZE_MB

const beforeUpload = (file: RcFile, setError: (isError: boolean) => void) => {
    if (!isValidFileType(file)) {
        notificationMessage({
            type: 'error',
            message: 'You can only upload JPG/PNG file!',
        })
        setError(true)
        return false
    }
    if (!isValidFileSize(file)) {
        notificationMessage({
            type: 'error',
            message: 'Image must be smaller than 5MB!',
        })
        setError(true)
        return false
    }
    return true
}

const handleUploadError = (error: any) => {
    notificationMessage({
        type: 'error',
        message: error.message,
    })
}

const handleUploadSuccess = (
    response: any,
    roomDetail: IGetRoomResponse,
    setRoomDetailLocal: (data: IGetRoomResponse) => void
) => {
    if (!response) return
    setRoomDetailLocal({
        ...roomDetail,
        avatar: response?.data?.path,
    })
}

const UploadAvatar = ({
    roomDetail,
    setRoomDetailLocal,
}: IProps) => {
    const [isError, setIsError] = useState<boolean>(false)

    const { mutateAsync: uploadAvatar } = useMutation(
        (file: any) => RoomService.updateRoomAvatar(roomDetail?._id, { file }),
        {
            onSuccess: (response) => handleUploadSuccess(response, roomDetail, setRoomDetailLocal),
            onError: handleUploadError,
        }
    )

    const handleChangeFile = (fileInfo: UploadChangeParam) => {
        if (isError) {
            setIsError(false)
            return
        }

        if (fileInfo.file.status !== 'removed') {
            uploadAvatar(fileInfo.file?.originFileObj || fileInfo.file)
        }
    }

    return (
        <Upload
            showUploadList={false}
            onChange={handleChangeFile}
            beforeUpload={(file) => beforeUpload(file, setIsError)}
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
