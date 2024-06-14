import { AvatarWrap } from '@/components/commons'
import { DotsLoadingIcon } from '@/components/icons'
import './style.scss'
import { ITypingUser } from '@/interface/common'

interface IProps {
    user: ITypingUser
}

export const TypingMessage: React.FC<IProps> = ({ user }) => {
    console.log('TypingMessage data: ', user);
    return (
        <div className='c-typing-item'>
            <div className='left'>
                <AvatarWrap size={28} src={user?.avatarUrl!} />
            </div>
            <div className='right'>
                <DotsLoadingIcon />
            </div>
        </div>
    )
}
