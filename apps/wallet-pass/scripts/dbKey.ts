import {createIvByProject} from '../src/services/projectService';
import {decrypt, encrypt, key} from '../src/_core/utils/crypto';

const dbSeed = key();
console.log('The key for db encrypto');
console.log('--------------------------');
console.log('key:', dbSeed.key);

console.log('\n');
console.log('Using this generated seed for a simple test ...');
console.log('--------------------------');
const i = createIvByProject('test');
console.log('simple iv:', i);

const rawText = 'This is a test data!';
console.log('rawText  :', rawText);

const encrypted = encrypt(dbSeed.key, i, rawText);
console.log('encrypted:', encrypted);

const decrypted = decrypt(dbSeed.key, i, encrypted);
console.log('decrypted:', decrypted);
