import crypto from 'crypto';

// Use a 32-byte (64 hex characters) key from environment variables
// Fallback is provided ONLY to prevent immediate crashes in dev if forgotten, 
// BUT in production this MUST be set.
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');

if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes is standard for GCM

/**
 * Validates a Canadian SIN using length, format, and Luhn algorithm.
 */
export function validateSIN(sin: string): boolean {
    const cleaned = sin.replace(/\D/g, '');
    if (cleaned.length !== 9) return false;

    // Reject known invalid test/dummy SINs if necessary, but Luhn is the primary check
    if (/^000/.test(cleaned)) return false; // Common invalid prefix

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(cleaned.charAt(i), 10);
        if (i % 2 !== 0) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
    }

    return sum % 10 === 0;
}

/**
 * Extracts the last 4 digits of a SIN for safe frontend display.
 */
export function extractSINLast4(sin: string): string {
    const cleaned = sin.replace(/\D/g, '');
    if (cleaned.length < 4) return cleaned; // Fallback for bad data
    return cleaned.slice(-4);
}

/**
 * Creates a deterministic hash of the SIN for safe database grouping and lookup.
 * Uses SHA-256 with the ENCRYPTION_KEY as a static system salt.
 */
export function hashSIN(sin: string): string {
    const cleaned = sin.replace(/\D/g, '');
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(cleaned);
    return hmac.digest('hex');
}

/**
 * Encrypts a string using AES-256-GCM.
 * Output format: ivHex:cipherHex:authTagHex
 */
export function encryptSIN(text: string): string {
    const cleaned = text.replace(/\D/g, '');

    // Generate a secure random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(cleaned, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

/**
 * Decrypts a string encrypted with AES-256-GCM.
 * Falls back to returning the plaintext if it doesn't match the new encrypted format.
 */
export function decryptSIN(encryptedValue: string): string {
    if (!encryptedValue) return '';

    const parts = encryptedValue.split(':');

    // Legacy support: If it doesn't have 3 hex parts, assume it's an old plaintext SIN
    if (parts.length !== 3) {
        return encryptedValue;
    }

    try {
        const [ivHex, cipherHex, authTagHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed for value. Proceeding carefully.', error);
        // Do not throw to completely break the app, but return a masked error
        return 'ERROR_DECRYPTING';
    }
}
