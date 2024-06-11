export const useQueryConfigs = {
    STALE_TIME: 10000,
    RETRY: false,
    WINDOW_FOCUS_REFETCH: false,
}

export const TIMEOUT_CALL = 30000

export enum NOTIFICATION_STATUS {
    ERROR = 'error',
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
}

export enum ESocketEvent {
    ERROR = 'ERROR',

    INFO_USER = 'INFO_USER',

    START_CALL = 'START_CALL',
    INCOMING_CALL = 'INCOMING_CALL',

    JOIN_CALL = 'JOIN_CALL',
    USER_JOINED = 'USER_JOINED',

    LEAVE_CALL = 'LEAVE_CALL',
    USER_LEAVE = 'USER_LEAVE',

    CANCEL_CALL = 'CANCEL_CALL',
    CALL_ENDED = 'CALL_ENDED',

    SEND_MESSAGE = 'SEND_MESSAGE',
    REMOVE_MESSAGE = 'REMOVE_MESSAGE',
    READ_LAST_MESSAGE = 'READ_LAST_MESSAGE',

    TYPING_MESSAGE = 'TYPING_MESSAGE',

    PING = 'PING',
    PONG = 'PONG',
}

export enum IMAGE_TYPE {
    PHOTO = 'photo',
    AVATAR = 'avatar',
}

export enum UPLOAD_LIST_TYPE {
    TEXT = 'text',
    PICTURE = 'picture',
    PICTURE_CARD = 'picture-card',
    PICTURE_CIRCLE = 'picture-circle',
}

export enum UPLOAD_FILE_STATUS {
    DONE = 'done',
    ERROR = 'error',
    UPLOADING = 'uploading',
    REMOVED = 'removed',
}

export enum MESSAGE_TYPE {
    TEXT = "Text",
    FILE = "File",
    CALL = "Call",
    LINK = "Link",
    NOTIFY = "Notification",
}
