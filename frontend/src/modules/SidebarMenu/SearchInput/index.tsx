import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface SearchInputProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
    return (
        <Input
            value={value}
            onChange={onChange}
            placeholder='Search'
            prefix={<SearchOutlined />}
        />
    )
}

export default React.memo(SearchInput)
