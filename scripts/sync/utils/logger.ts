import dayjs from 'dayjs';

export function log(message: string) {
    const timestamp = dayjs().format('HH:mm:ss');
    console.log(`[${timestamp}] ${message}`);
}
