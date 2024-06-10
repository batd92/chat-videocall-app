export const downloadFileByUrl = async (fileUrl: string, fileName: string) => {
    const response = await fetch(fileUrl || '')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()

    // clean up 'a' element & remove ObjectURL
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
