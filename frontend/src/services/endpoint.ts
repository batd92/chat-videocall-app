export const ENDPOINT = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: 'users/logout',
        GET_ME: 'profile',
    },
    ROOM: {
        GET_ROOMS: 'rooms',
        GET_ROOM_DETAIL: 'rooms/:id',
        CREATE_ROOM: 'rooms',
        INVITES_TO_ROOM: 'rooms/invites',
        TEST_CALL: 'rooms/test-call',
        UPDATE_ROOM: 'rooms/:id',
        UPDATE_ROOM_NAME: 'rooms/:id/room-name',
        UPDATE_ROOM_AVATAR: 'rooms/:id/avatar',
    },
    USER: {
        GET_FRIENDS: 'users',
    },
    MESSAGE: {
        GET_MESSAGES: 'messages/room/:id',
    },
    UPLOAD: {
        UPLOAD_MEDIA: 'files/upload',
    },
}
