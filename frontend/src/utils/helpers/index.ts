import { Modal, notification } from 'antd';
import { IMAGE_TYPE, UPLOAD_FILE_STATUS } from '../constants';
import moment from 'moment';
import { TypeFileStorage } from '@/interface/response';

interface INotificationModal {
    title?: string;
    content: string | React.ReactNode;
    okText?: string;
    cancelText?: string;
    onOk?: () => void;
    onCancel?: () => void;
    type: 'confirm' | 'warning' | 'info' | 'error';
    maskClosable?: boolean;
    keyboard?: boolean;
    width?: string | number;
    icon?: React.ReactNode;
    className?: string;
}

interface INotificationMessage {
    title?: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    duration?: number; // Time in seconds
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

/**
 * Show a notification modal.
 */
export const notificationModal = ({
    title,
    content,
    okText,
    cancelText,
    onOk,
    onCancel,
    type,
    maskClosable = true,
    keyboard = true,
    width,
    icon,
    className,
}: INotificationModal) => {
    return Modal[type]({
        title,
        content,
        okText: okText || 'OK',
        cancelText: cancelText || 'Cancel',
        onOk,
        onCancel,
        centered: true,
        maskClosable,
        keyboard,
        width,
        icon,
        className,
    });
};

/**
 * Show a notification message.
 */
export const notificationMessage = ({
    title,
    message,
    type,
    duration,
    placement,
}: INotificationMessage) => {
    return notification[type]({
        message: title,
        description: message,
        duration,
        placement,
    });
};

/**
 * Get room name by user list and id list.
 */
export const getRoomName = (userList: any[], idList: any[]) => {
    const userMap: Record<string, string> = userList.reduce(
        (acc, user) => ({ ...acc, [user._id]: user.name }),
        {}
    );

    return idList.map((userId) => userMap[userId] || 'Unknown').join(', ');
};

/**
 * Truncate string to specified max length.
 */
export const trunMessage = (str: string, maxLength: number) => {
    if (!str) return '';
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Pick specific fields from an object.
 */
export function pickData<T, K extends keyof T>(item: T, fields: K[]): Pick<T, K> {
    return fields.reduce((acc, key) => {
        if (item[key] !== undefined) acc[key] = item[key];
        return acc;
    }, {} as Pick<T, K>);
}

/**
 * Get image by type or return blank image.
 */
export const getImage = (image: string | null, type: IMAGE_TYPE) => {
    const imageBlank: Record<IMAGE_TYPE, string> = {
        [IMAGE_TYPE.PHOTO]: '/images/blank_photo.png',
        [IMAGE_TYPE.AVATAR]: '/images/blank_avatar.png',
    };

    return image ?? imageBlank[type] ?? '';
};

/**
 * Display formatted message time.
 */
export const formatDateTime = (inputTime: string | number) => {
    if (!inputTime) return '';
    return moment(inputTime).format('DD/MM/YYYY HH:mm:ss')
};

/**
 * Get user by id from a list of users.
 */
export const getUserById = (userId: string, users: any[]) => {
    return users.find((user) => user._id === userId);
};

/**
 * Convert link to file object.
 */
export const convertLinkToFileObject = (uid: string, url: string, status: UPLOAD_FILE_STATUS, type: string) => {
    return {
        uid,
        url,
        name: url.substring(url.lastIndexOf('/') + 1),
        status,
        type,
    };
};

/**
 * Get file type based on MIME type.
 */
export const getFileType = (type: string) => {
    if (type.includes('video')) return TypeFileStorage.VIDEO;
    if (type.includes('image')) return TypeFileStorage.IMAGE;
    return TypeFileStorage.DOC;
};

/**
 * Convert file list to Ant Design file objects.
 */
export const convertToFileObjectAntd = (fileList: any[]) => {
    return fileList.map((file) => ({
        uid: file.uid,
        url: file.url,
        name: file.name,
        status: file.status,
    }));
};
