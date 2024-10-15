import crypto from 'crypto';

export function key() {
  const key = crypto.randomBytes(32);
  return {
    key: key.toString('base64'),
  };
}

export function encrypt(k: string, i: string, text: string) {
  const key = Buffer.from(k, 'base64');
  const iv = Buffer.from(i, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

export function decrypt(k: string, i: string, text: string) {
  const key = Buffer.from(k, 'base64');
  const iv = Buffer.from(i, 'hex');
  const dedecipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = dedecipher.update(Buffer.from(text, 'hex'));
  decrypted = Buffer.concat([decrypted, dedecipher.final()]);
  return decrypted.toString();
}
