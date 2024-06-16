'use client'

import { useAuth } from '@/providers/auth'
import { AuthService } from '@/services'
import { APP_ROUTER } from '@/utils/constants/router'
import { notificationMessage, pickData } from '@/utils/helpers'
import { Button, Form, Input, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useMutation } from 'react-query'
import './style.scss'
import { useFcmToken } from '@/providers/fcm-token'

const LoginPage = () => {
    const router = useRouter()
    const { logInSuccess, setCurrentUser } = useAuth()
    const { deviceId, fcmToken, notificationPermissionStatus } = useFcmToken()

    const handleLoginSuccess = (response: any) => {
        logInSuccess({
            access_token: response.access_token,
            refresh_token: response.access_token,
        })
        updateCurrentUser()
    }

    const handleLoginError = (error: any) => { message.error(error.message)}

    const { mutate: mutateLogin, isLoading: isLoginLoading } = useMutation(
        (values: any) => {
            const user = {
                email: values.email || 'admin',
                username: values.email || 'admin',
                password: values.password || 'password',
                deviceId: deviceId,
                firebaseToken: fcmToken,
                os: 'Web',
            }
            return AuthService.login(user)
        },
        {
            onSuccess: handleLoginSuccess,
            onError: handleLoginError,
        },
    )

    const getProfileUserSuccess = (response: any) => {
        try {
            console.log('response.data .....', response.data)
            setCurrentUser(pickData(response.data, ['_id', 'avatar', 'email', 'username', 'firstName', 'lastName']))
            router.push(APP_ROUTER.MESSAGE.CHAT_EMPTY)   
        } catch (error) {
            console.log(error)
        }
    }

    const { mutate: updateCurrentUser } = useMutation(
        AuthService.getMe, 
        {
            onSuccess: getProfileUserSuccess
        }
    )

    const onFinish = (values: any) => {
        if (notificationPermissionStatus !== 'granted') {
            if (
                window.confirm(
                'Thông báo hiện tại đang bị chặn, bạn có muốn bỏ qua hay không ?',
                )
            ) {
                mutateLogin(values)
            }
        } else {
            mutateLogin(values)
        }
    }

    return (
        <div className='p-login'>
            <h1>Login</h1>
            <Form
                name='basic'
                labelCol={{ span: 8 }}
                onFinish={onFinish}
                autoComplete='off'
                className='login-form'
            >
                <Form.Item
                label='Username'
                name='email'
                rules={[{ required: false, message: 'Please input your email!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item
                label='Password'
                name='password'
                rules={[{ required: false, message: 'Please input your password!' }]}
                >
                <Input.Password />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type='primary' htmlType='submit' loading={isLoginLoading}>
                    Login
                </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default LoginPage
