"use client"

import { RoomService } from "@/services";
import { ENDPOINT } from "@/services/endpoint";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

function VideoCall() {
    const path = useSearchParams()
    const [isOpen, setIsOpen] = useState(true)
    const { data: infoCall, refetch: refetch } = useQuery(
        [ENDPOINT.ROOM.TEST_CALL],
        () => RoomService.testCall(path.get("id") as string),
        {
            onSuccess: (response: any) => {
            },
        },
    )

    return (
        <div style={{ height: "200vh" }}>
            {isOpen && infoCall?.data && <JitsiMeeting
                domain={"xxx.yyy.com"}
                roomName={infoCall.data.roomName}
                jwt={infoCall.data.token}
                onApiReady={(externalApi) => {

                }}
                interfaceConfigOverwrite={
                    {
                        TOOLBAR_BUTTONS: [
                            "microphone", "camera",
                            'hangup',
                        ]
                    }
                }
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '80vh';
                }}
                onReadyToClose={() => {
                    setIsOpen(false)
                }}
            />
            }
        </div>
    );
}

export default VideoCall;

