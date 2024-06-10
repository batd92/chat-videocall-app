/* eslint-disable @next/next/no-img-element */
'use client'
import { UPLOAD_LIST_TYPE } from '@/utils/constants'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Modal, Upload, UploadProps } from 'antd'
import { RcFile } from 'antd/es/upload'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import './style.scss'

interface IPreviewModal {
    visible: boolean
    image: string
    title: string
}

export const UploadWrap = ({
    onChangeFiles,
    filesLimit,
    uploadedFiles,
    onRemoveFiles,
    listType,
    accept,
    className,
    beforeUpload,
    uploadBtnText = 'Tải lên',
    ...props
}: any) => {
    const [fileList, setFileList] = useState<any>([])
    const [previewModal, setPreviewModal] = useState<IPreviewModal>({
        visible: false,
        image: '',
        title: '',
    })

    useEffect(() => {
        setFileList(uploadedFiles)
    }, [uploadedFiles])

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = (error) => reject(error)
        })

    const handlePreviewModal = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile)
        }

        setPreviewModal({
            ...previewModal,
            visible: true,
            image: file.url || file.preview,
            title: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        })
    }

    const handleCancelModal = () => {
        setPreviewModal({
            ...previewModal,
            visible: false,
        })
    }

    const handleChange: UploadProps['onChange'] = ({ file, fileList }) => {
        onChangeFiles({ file, fileList })
        setFileList(fileList)
    }

    const renderUploadButton = (listType: string) => {
        switch (listType) {
            case UPLOAD_LIST_TYPE.TEXT:
            case UPLOAD_LIST_TYPE.PICTURE:
                return <Button icon={<UploadOutlined />}>{uploadBtnText}</Button>
            case UPLOAD_LIST_TYPE.PICTURE_CARD:
            case UPLOAD_LIST_TYPE.PICTURE_CIRCLE:
                return (
                    <div className='plus-upload-btn'>
                        <PlusOutlined />
                        <div className='upload-btn-text' style={{ marginTop: 8 }}>
                            {uploadBtnText}
                        </div>
                    </div>
                )
            default:
                return <Button icon={<UploadOutlined />}>{uploadBtnText}</Button>
        }
    }

    return (
        <div className={clsx('c-upload-wrap', className)}>
            <Upload
                listType={listType}
                multiple={true}
                fileList={fileList}
                onPreview={handlePreviewModal}
                onChange={handleChange}
                accept={accept}
                maxCount={filesLimit}
                beforeUpload={beforeUpload}
                onRemove={(removedFile) => {
                    const result = uploadedFiles?.filter(
                        (item: any) => item.uid !== removedFile.uid,
                    )
                    setFileList(result)
                    onRemoveFiles(removedFile)
                }}
                {...props}
            >
                {fileList.length >= filesLimit ? null : renderUploadButton(listType)}
            </Upload>
            <Modal
                open={previewModal.visible}
                title={previewModal.title}
                footer={null}
                onCancel={handleCancelModal}
            >
                <img alt='' style={{ width: '100%' }} src={previewModal.image} />
            </Modal>
        </div>
    )
}