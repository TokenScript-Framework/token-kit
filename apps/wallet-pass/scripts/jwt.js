const {createSigner} = require('fast-jwt');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'SuPeRpaSsW0rd';
const payload = {user: 'dummy'};
const token = createSigner({key: JWT_SECRET})(payload);

console.log(`jwt = ${token}`);
