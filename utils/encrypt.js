import {Transform} from 'node:stream';
import { createCipheriv } from 'node:crypto';

class EncryptStream extends Transform {
    constructor(algorithm, key, iv, options) {
        super(options);
        this.iv = iv;
        this.appended = false;
        this.cipher = createCipheriv(algorithm, key, iv);
    }

    _transform(chunk, enc, cb) {
        if(!this.appended) {
            this.push(`${this.iv.toString('hex')}:`);
            this.appended = true;
        }
        const encryptedChunk = this.cipher.update(chunk, enc);
        this.push(encryptedChunk);
        cb()
    }

    _flush(cb) {
        const finalChunk = this.cipher.final();
        this.push(finalChunk);
        cb();
    }
}

export default EncryptStream;