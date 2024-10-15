import axios from 'axios';
import crypto from 'crypto';

const GOOGLE_PUBLIC_KEY_URL = 'https://pay.google.com/gp/m/issuer/keys';
const GOOGLE_SENDER_ID = 'GooglePayPasses';
const EXPIRATION_INTERVAL = 3600; // check 1 hour before key expires
const PROTOCOL_VERSION = 'ECv2SigningOnly';

export default class PaymentTokenRecipient {
  private googlePublicKeys: Buffer[] = [];
  private publicKeyExpiration = new Date();

  async unseal(issuerId: string, message: any) {
    try {
      await this._refreshPublicKeys();
      const signedMessage = this._verifyECV2(issuerId, message);
      return JSON.parse(signedMessage);
    } catch (err) {
      throw new Error('could not verify message');
    }
  }

  async _fetchPublicKeys() {
    const response = await axios.get(GOOGLE_PUBLIC_KEY_URL);
    return response.data;
  }

  async _refreshPublicKeys() {
    if (
      !this.googlePublicKeys?.length ||
      this.publicKeyExpiration <= new Date()
    ) {
      const result = await this._fetchPublicKeys();
      if (Array.isArray(result.keys)) {
        let publicKeyExpiration: Date | undefined;
        const googlePublicKeys: Buffer[] = [];
        for (const key of result.keys) {
          googlePublicKeys.push(Buffer.from(key.keyValue, 'base64'));
          const keyExpiration = new Date(key.keyExpiration);
          if (!publicKeyExpiration || keyExpiration < publicKeyExpiration) {
            publicKeyExpiration = keyExpiration;
          }
        }
        this.googlePublicKeys = googlePublicKeys;
        this.publicKeyExpiration = new Date(publicKeyExpiration!);
        this.publicKeyExpiration.setUTCSeconds(
          this.publicKeyExpiration.getUTCSeconds() - EXPIRATION_INTERVAL
        );
      }
    }
  }

  _toLengthValue(...chunks: any[]) {
    const buffers = [];
    for (const chunk of chunks) {
      const value = Buffer.from(chunk);
      const length = Buffer.alloc(4);
      length.writeInt32LE(value.byteLength);
      buffers.push(length);
      buffers.push(value);
    }
    return Buffer.concat(buffers);
  }

  _verify(
    publicKey: Buffer,
    signature: NodeJS.ArrayBufferView,
    signedBytes: NodeJS.ArrayBufferView
  ) {
    return crypto.verify(
      'sha256',
      signedBytes,
      {key: publicKey, format: 'der', type: 'spki', dsaEncoding: 'der'},
      signature
    );
  }

  _verifyIntermediateSigningKey(jsonMsg: any) {
    const intermediateSigningKey = jsonMsg.intermediateSigningKey;
    const signedKeyAsString = intermediateSigningKey.signedKey;
    const signatures = [];
    for (const signature of intermediateSigningKey.signatures) {
      signatures.push(Buffer.from(signature, 'base64'));
    }
    const signedBytes = this._toLengthValue(
      GOOGLE_SENDER_ID,
      PROTOCOL_VERSION,
      signedKeyAsString
    );
    let verified = false;
    for (const publicKey of this.googlePublicKeys) {
      for (const signature of signatures) {
        if (this._verify(publicKey, signature, signedBytes)) {
          verified = true;
        }
      }
    }
    if (verified) {
      const signedKey = JSON.parse(signedKeyAsString);
      if (signedKey.keyExpiration > new Date().getTime()) {
        return Buffer.from(signedKey.keyValue, 'base64');
      } else {
        throw new Error('intermediate signing key expired');
      }
    } else {
      throw new Error('could not verify intermediate signing key');
    }
  }

  _verifyECV2(recipientId: string, jsonMsg: any) {
    const signature = Buffer.from(jsonMsg.signature, 'base64');
    const signedMessage = jsonMsg.signedMessage;
    const signedBytes = this._toLengthValue(
      GOOGLE_SENDER_ID,
      recipientId,
      PROTOCOL_VERSION,
      signedMessage
    );
    const verified = this._verify(
      this._verifyIntermediateSigningKey(jsonMsg),
      signature,
      signedBytes
    );
    if (verified) {
      return signedMessage;
    } else {
      throw new Error('could not verify message');
    }
  }
}
