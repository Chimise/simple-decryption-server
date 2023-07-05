import {Transform} from 'node:stream';

class DecryptStream extends Transform {
    constructor(algorithm, key, options) {
        super(options);
        this.iv = '';
        this.found = false;
        this.decipher = null;
        this.algorithm = algorithm;
        this.key = key;
    }

    _transform(chunk, enc, cb) {
        if(!this.found) {
            const pieces = (this.iv + chunk).split(':');
            this.iv = pieces.splice(0, 1)[0];
            if(pieces.length) {
                this.found = true;
                this.push(pieces.join());
            }

        }else {
            if(!this.decipher) {
                this.decipher = createDecipheriv(this.algorithm, this.key, this.iv);
            }
            const decipherChunk = this.decipher.update(chunk, enc);
            this.push(decipherChunk);
        }
        cb();
    }

    _flush(cb) {
        const finalChunk = this.decipher.final();
        this.push(finalChunk);
        cb();
    }
}

export default DecryptStream;