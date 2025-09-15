import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const encryptionKey = process.env.ENCRYPTION_KEY || 'my-encryption-key';

if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY environment variable is not set.');
}

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(encryptionKey!, 'salt', 32); // Use a consistent key derived from an environment variable
const iv = crypto.randomBytes(16);

export const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv:            iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
};

export const decrypt = (text: { iv: string; encryptedData: string }) => {
  const iv = Buffer.from(text.iv, 'hex');
  const encryptedText = Buffer.from(text.encryptedData, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

export const hashEmail = (email: string) => {
  return crypto.createHash('sha256').update(email).digest('hex');
};

// Short Link Encryption
export const generateShortLinkToken = (originalToken: string) => {
  const shortId = uuidv4(); // Generate a unique id
  const encryptedToken = encrypt(originalToken);

  // Save the mapping of shortId to encryptedToken in the database
  // Add a method to save this to the database (not shown here for brevity)
  return {
    shortId,
    encryptedToken
  };
};

export const decryptShortLinkToken = (encryptedData: { iv: string; encryptedData: string }) => {
  return decrypt(encryptedData);
};
