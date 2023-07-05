import http from 'node:http';
import {pipeline} from 'node:stream';
import { createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDecryptAndDecompress } from './utils/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const password = process.argv[2];
    const PORT = process.env.PORT || 3000;

    if(!password) {
        throw new Error('Must provide a password');
    }

    const server = http.createServer((req, res) => {
        modify(res);
        const url = new URL(req.url, `http://${req.headers.host}`);
        if(url.pathname === '/' && req.method === 'PUT') {
            const filename = req.headers['x-filename'];
            pipeline(req, createDecryptAndDecompress(password), createWriteStream(join(__dirname, 'assets', filename)), (err) => {
                if(err) {
                    return console.log(err);
                }
                res.status(201).json({message: 'Successfully saved file'});
            })
        }else {
            res.status(405).json({message: 'Method not supported'});
        }
    })

    server.listen(PORT, () => {
        console.log('Listening on port %d', PORT);
    })
}


function modify(res) {
    res.json = function(obj) {
        const headers = res.headers || {};
        this.headers = {...headers, 'Content-Type': 'application/json'};
        this.write(JSON.stringify(obj));
        this.end();
    }

    res.status = function(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
}

main().catch(err => console.log(err));