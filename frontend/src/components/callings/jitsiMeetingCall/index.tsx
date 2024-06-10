'use client'

import { JitsiMeeting } from '@jitsi/react-sdk'
import { Modal } from 'antd'
import React from 'react'
import './style.scss'

interface IModalWrap {
    tokenJitsi: string
    roomNameJitsi: string
    isOpen: boolean
    onCancel: () => void
}
const JitsiMeetingCall: React.FC<IModalWrap> = ({
    tokenJitsi,
    roomNameJitsi,
    isOpen = false,
    onCancel,
}) => {
    return (
        <>
            <Modal
                open={isOpen}
                closeIcon={<></>}
                className='jitsi-modal'
                footer={<></>}
            >
                <JitsiMeeting
                    domain={process.env.NEXT_PUBLIC_BACKEND_VIDEO_CALL}
                    roomName={roomNameJitsi}
                    jwt={tokenJitsi}
                    onApiReady={(externalApi) => { }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '80vh'
                    }}
                    onReadyToClose={() => {
                        onCancel()
                    }}
                />
            </Modal>
        </>
    )
}

export default JitsiMeetingCall
