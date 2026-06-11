import * as jose from 'jose';
import { config } from './config';

const secret = new TextEncoder().encode(config.jwtSecret);

export async function signJWT(payload: any): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Sesi berlaku 7 hari
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
