import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import * as keytar from 'keytar';

const SERVICE_NAME = 'FormTestServer';
const ACCOUNT_NAME = 'payment-encryption-key';
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;

/**
 * Encryption utility for securing payment method credentials
 * Uses AES-256-GCM for authenticated encryption
 */

/**
 * Get or generate encryption key from OS keychain
 */
async function getEncryptionKey(): Promise<Buffer> {
  try {
    // Try to retrieve existing key
    const existingKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    
    if (existingKey) {
      console.log('Encryption: Using existing encryption key from keychain');
      return Buffer.from(existingKey, 'hex');
    }
    
    // Generate new key if none exists
    console.log('Encryption: Generating new encryption key');
    const newKey = randomBytes(KEY_LENGTH);
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, newKey.toString('hex'));
    console.log('Encryption: New key stored in keychain');
    
    return newKey;
  } catch (error) {
    console.error('Encryption: Failed to access keychain:', error);
    throw new Error('Failed to initialize encryption key');
  }
}

/**
 * Encrypt sensitive data
 * @param plaintext - Data to encrypt (will be JSON stringified)
 * @returns Encrypted data as base64 string with format: iv:authTag:salt:ciphertext
 */
export async function encrypt(plaintext: any): Promise<string> {
  try {
    // Convert to JSON string
    const plaintextStr = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
    
    // Get encryption key
    const masterKey = await getEncryptionKey();
    
    // Generate random IV and salt
    const iv = randomBytes(IV_LENGTH);
    const salt = randomBytes(SALT_LENGTH);
    
    // Derive key from master key and salt using scrypt
    const key = scryptSync(masterKey, salt, KEY_LENGTH);
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    let encrypted = cipher.update(plaintextStr, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine: iv:authTag:salt:ciphertext
    const result = [
      iv.toString('base64'),
      authTag.toString('base64'),
      salt.toString('base64'),
      encrypted
    ].join(':');
    
    return result;
  } catch (error) {
    console.error('Encryption: Failed to encrypt data:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data in format: iv:authTag:salt:ciphertext
 * @returns Decrypted data (parsed as JSON if possible)
 */
export async function decrypt(encryptedData: string): Promise<any> {
  try {
    // Split encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivBase64, authTagBase64, saltBase64, ciphertext] = parts;
    
    // Convert from base64
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const salt = Buffer.from(saltBase64, 'base64');
    
    // Get encryption key
    const masterKey = await getEncryptionKey();
    
    // Derive key from master key and salt
    const key = scryptSync(masterKey, salt, KEY_LENGTH);
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Try to parse as JSON
    try {
      return JSON.parse(decrypted);
    } catch {
      // Return as string if not valid JSON
      return decrypted;
    }
  } catch (error) {
    console.error('Encryption: Failed to decrypt data:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Check if data is encrypted (has the expected format)
 */
export function isEncrypted(data: string): boolean {
  if (typeof data !== 'string') return false;
  const parts = data.split(':');
  return parts.length === 4;
}

/**
 * Delete encryption key from keychain (for testing/reset)
 */
export async function deleteEncryptionKey(): Promise<void> {
  try {
    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
    console.log('Encryption: Key deleted from keychain');
  } catch (error) {
    console.error('Encryption: Failed to delete key:', error);
  }
}
