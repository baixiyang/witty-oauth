const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

console.log(privateKey.export(), publicKey, 123)

// Sign JWT using private key
const payload = { sub: '1234567890', name: 'John Doe' };
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
jwt.verify(token, publicKey, { algorithm: 'RS256' });
console.log(token);