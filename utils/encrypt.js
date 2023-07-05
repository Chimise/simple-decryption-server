import {Transform} from 'node:stream';

class EncryptStream extends Transform {
    constructor(iv, algorithm, key, options) {
        super(options);
        this.iv = iv;
        this.appended = false;
        this.cipher = createCipheriv(algorithm, iv, key);
    }

    _transform(chunk, enc, cb) {
        if(!this.appended) {
            this.push(`${this.iv}:`);
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