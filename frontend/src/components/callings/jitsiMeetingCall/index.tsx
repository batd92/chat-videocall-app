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
                    domain={process.env.NEXT_PUBLIC_BACKEND_VIDEO_CALL || 'localhost:8443'}
                    roomName={roomNameJitsi}
                    jwt={tokenJitsi}
                    onApiReady={() => { }}
                    getIFrameRef={(iframeRef: any) => {
                        iframeRef.style.height = '80vh'
                    }}
                    onReadyToClose={() => { onCancel() }}
                    configOverwrite ={{
                        
                    }}
                />
            </Modal>
        </>
    )
}

export default JitsiMeetingCall
