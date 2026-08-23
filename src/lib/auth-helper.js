import crypto from 'crypto';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'galatasaray-secret-key-1905';
export const COOKIE_NAME = 'admin_session';

/**
 * Base64URL encode helper
 * @param {object} obj 
 * @returns {string}
 */
function base64urlEncode(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode helper
 * @param {string} str 
 * @returns {object}
 */
function base64urlDecode(str) {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
}

/**
 * Sign a payload into a JWT
 * @param {object} payload 
 * @param {number} expiresInSeconds 
 * @returns {string}
 */
export function signToken(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  
  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(fullPayload);
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64url');
    
  return `${signatureInput}.${signature}`;
}

/**
 * Verify a JWT
 * @param {string} token 
 * @returns {object|null} payload or null if invalid/expired
 */
export function verifyToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = base64urlDecode(encodedPayload);
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token has expired
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to check auth status in route handlers or server actions
 * @returns {object|null} payload or null
 */
export async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}
