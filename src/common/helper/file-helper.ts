import { promisify } from 'util';
import * as fs from 'fs';

export const unlinkAsync = promisify(fs.unlink);

export async function deleteFileOnServer(filePath: string, urlServer: string): Promise<void> {
    const path = filePath.replace(/\\/g, '/').replace(`${urlServer}/`, '');
    if (fs.existsSync(path)) {
        await unlinkAsync(path);
    }
}

export function excludeData<T extends object, K extends keyof T>(item: T, fields: K[]): Omit<T, K> {
    let data: Omit<T, K> = {} as Omit<T, K>;

    Object.keys(item).forEach((key: string) => {
        if (!(fields as string[]).includes(key)) {
            Object.assign(data, { [key]: item[key] });
        }
    });

    return data;
}