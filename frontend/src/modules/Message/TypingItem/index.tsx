import { AvatarWrap } from '@/components/commons'
import { DotsLoadingIcon } from '@/components/icons'
import { IGetMeResponse } from '@/interface/response'
import './style.scss'

interface IProps {
    data: IGetMeResponse
}

export const TypingItem: React.FC<IProps> = ({ data }) => {
    return (
        <div className='c-typing-item'>
            <div className='left'>
                <AvatarWrap size={28} src={data?.avatarUrl!} />
            </div>
            <div className='right'>
                <DotsLoadingIcon />
            </div>
        </div>
    )
}
