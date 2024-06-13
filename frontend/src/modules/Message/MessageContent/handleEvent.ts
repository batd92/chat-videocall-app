// useSocketHelpers.ts

import { useSocket } from '@/providers/Socket/index';
import { ESocketEvent } from '@/utils/constants/index';

interface MessagePayload {
    userId?: string;
    actionType?: number;
    roomId: string;
    _id?: string;
}

export const useSocketHelpers = () => {
    const { sendMessage } = useSocket();

    const sendSocketMessage = (event: ESocketEvent, payload: any) => {
        sendMessage(JSON.stringify({ event, payload }));
    };

    const onStartCall = (roomId: string) => {
        sendSocketMessage(ESocketEvent.START_CALL, { roomId });
    };

    const onCancelCall = (roomId: string) => {
        sendSocketMessage(ESocketEvent.CANCEL_CALL, { roomId });
    };

    const onEndCall = (roomId: string) => {
        sendSocketMessage(ESocketEvent.LEAVE_CALL, { roomId });
    };

    const onSendReaction = (payload: any) => {
        sendSocketMessage(ESocketEvent.ACTION_MESSAGE, payload);
    };

    const onReadLastMessage = (roomId: string) => {
        sendSocketMessage(ESocketEvent.READ_LAST_MESSAGE, { roomId });
    };

    return {
        onStartCall,
        onCancelCall,
        onEndCall,
        onSendReaction,
        onReadLastMessage,
    };
};
