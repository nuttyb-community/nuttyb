import { Base64 } from 'base64-string';

export function encode(data: string): string {
    const enc = new Base64();

    return enc.urlEncode(data).replace(/=+$/, '');
}

export function decode(data: string): string {
    const enc = new Base64();

    return enc.decode(data);
}
