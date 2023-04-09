const crypto = require('node:crypto');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');

// Generate RSA key pair
let { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

fs.writeFileSync('private.pem', privateKey.export({
    type: 'pkcs1',
    format: 'pem',
}));

// Save public key to file
fs.writeFileSync('public.pem', publicKey.export({
    type: 'pkcs1',
    format: 'pem',
}));

// 载入私钥文件
privateKey = fs.readFileSync('private.pem');

// 载入公钥文件
publicKey = fs.readFileSync('public.pem');

// Sign JWT using private key
const payload = { sub: '1234567890', name: 'John Doe' ,d: 'adfasdkf;alkdf;aksdf;askdfj', b: 'adf;alsdkfj;akdsjf;aksdjf;aksdjf;aksdjf;aksdjf;aksdjf;aksdjf;aksdjf;aksdfj;adskfj;asdkfj;askdjf;aksdjf;aksdjf;aksdjf;aksdjf;aksdjf;aksdfj;aksdjf;aksdjf;akdsfj'};
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
console.log(11,jwt.verify(token, publicKey))
