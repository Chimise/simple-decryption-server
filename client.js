import http from "node:http";
import { basename } from "node:path";
import {pipeline} from 'node:stream'
import { createReadStream } from "node:fs";
import { createCompressAndEncrypt } from "./utils/index.js";

async function main() {
  const password = process.argv[3];
  const url = process.argv[4];
  const filename = process.argv[2];
  if (!password) {
    throw new Error("Password must be provided");
  }

  if (!url) {
    throw new Error("Server url must be provided");
  }

  const parsedUrl = new URL(url);

  const req = http.request({
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    method: "PUT",
    path: "/",
    headers: {
      "x-filename": basename(filename),
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "gzip",
    },
  }, (res) => {
    console.log('Server response: ' + res.statusCode);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk.toString();
    })

    res.on('end', () => {
        console.log(data);
    })
  });

  pipeline(createReadStream(filename), createCompressAndEncrypt(password), req, (err) => {
    if(err) {
        return console.log(err);
    }
    console.log('File successfully uploaded')
  })
  
}


main().catch(err => console.log(err));


