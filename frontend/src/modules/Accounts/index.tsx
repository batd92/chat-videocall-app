import { AvatarWrap, AvatarGroupWrap, SpinWrap, TooltipWrap, UploadWrap } from '@/components/commons';

import { useAuth } from '@/providers/auth'
import { APP_ROUTER } from '@/utils/constants/router'
import { deleteCookie } from '@/utils/helpers/storage'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, MenuProps } from 'antd'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services'
import { useFcmToken } from '@/providers/fcm-token'
import './style.scss'

const AccountDropdown = () => {
    const { currentUser } = useAuth()
    const router = useRouter()
    const { deviceId } = useFcmToken()
    const handleLogout = () => {
        deleteCookie('access_token')
        deleteCookie('refresh_token')
        deleteCookie('currentUser')
        AuthService.logout({ userId: currentUser?._id || '0', deviceId })
        router.push(APP_ROUTER.AUTH.LOGIN)
    }

    const items: MenuProps['items'] = [
        {
            key: '1',
            type: 'group',
            label: <div className='group-label'>{currentUser?.email}</div>,
            children: [
                {
                    key: '1-1',
                    label: (
                        <div className='menu-label'>
                            <UserOutlined /> {currentUser?.lastName}
                        </div>
                    ),
                },
                {
                    key: '1-2',
                    label: (
                        <div className='menu-label' onClick={handleLogout}>
                            <LogoutOutlined /> Logout
                        </div>
                    ),
                },
            ],
        },
    ]
    return (
        <Dropdown
            menu={{ items: items }}
            placement='bottomLeft'
            trigger={['click']}
            overlayClassName='c-dropdown no-select'
        >
            <Button
                type='link'
                style={{ width: 36, height: 36, padding: 0 }}
            >
                <div className="online-status">
                    <AvatarWrap src={currentUser?.avatar!} size={36} />
                    <div className="status-indicator"></div>
                </div>
            </Button>
        </Dropdown>
    )
}

export default AccountDropdown
