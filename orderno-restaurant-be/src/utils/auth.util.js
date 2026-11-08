const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'ordeno_luxury_secret_jwt_key_2026';
const JWT_EXPIRES_IN_SEC = 24 * 60 * 60; // 24 hours

/**
 * Hash a plain password using PBKDF2 with a random salt
 * Format: "salt:hash"
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain password against the stored "salt:hash"
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, originalHash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const originalBuf = Buffer.from(originalHash, 'hex');
    const verifyBuf = Buffer.from(verifyHash, 'hex');
    if (originalBuf.length !== verifyBuf.length) return false;
    return crypto.timingSafeEqual(originalBuf, verifyBuf);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a JWT token using HMAC-SHA256
 */
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRES_IN_SEC;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
};
