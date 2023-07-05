import {createGzip, createGunzip} from 'node:zlib';
import {scryptSync, randomBytes} from 'node:crypto';
import pumpify from 'pumpify';
import EncryptStream from './encrypt.js';
import DecryptStream from './decrypt.js';

const createKey = (password, length = 24) => {
    return scryptSync(password, 'salt', length);
}


export const createCompressAndEncrypt = (password) => {
    const key = createKey(password);
    const iv = randomBytes(16);
    return pumpify(createGzip(), new EncryptStream('aes192', iv, key));
}

export const createDecryptAndDecompress = (password) => {
    const key = createKey(password);
    return pumpify(new DecryptStream('aes192', key), createGunzip());
}