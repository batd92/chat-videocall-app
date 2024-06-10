import http from '../axiosClient'
import { ENDPOINT } from '../endpoint'

class Upload {
    uploadMedia = async (file: any): Promise<any> => {
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)

        const res: any = await http.post(ENDPOINT.UPLOAD.UPLOAD_MEDIA, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return res
    }
}

export const UploadService = new Upload()
