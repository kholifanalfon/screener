import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { app } from '../src/index';

let server: any;
const PORT = 3009;
const testEmail = `test-user-${Date.now()}@screener.com`;
const testPassword = 'password123';
const testFullName = 'Test Account';

// Dapatkan signature key dari environment
const signature = process.env.BE_APP_SIGNATURE || '';

const headers = {
  'Content-Type': 'application/json',
  'x-app-signature': signature,
};

beforeAll(() => {
  server = app.listen(PORT);
});

afterAll(() => {
  server.close();
});

describe('Authentication Integration Tests', () => {
  let sessionCookie = '';

  it('should block requests without valid x-app-signature header', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(response.status).toBe(403);
    const data: any = await response.json();
    expect(data.status).toBe('error');
    expect(data.message).toContain('Forbidden');
  });

  it('should register a new user successfully', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
      }),
    });

    expect(response.status).toBe(201);
    const data: any = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.user.email).toBe(testEmail);
    expect(data.data.user.fullName).toBe(testFullName);
    expect(data.data.user.id).toBeDefined();
  });

  it('should fail to register a user with duplicate email', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should fail to login with invalid credentials', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should login user successfully and set session cookie', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    expect(response.status).toBe(200);
    const data: any = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.token).toBeDefined();

    const cookieHeader = response.headers.get('set-cookie');
    expect(cookieHeader).not.toBeNull();
    if (cookieHeader) {
      sessionCookie = cookieHeader.split(';')[0];
    }
  });

  it('should retrieve profile with session cookie', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    expect(response.status).toBe(200);
    const data: any = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.user.email).toBe(testEmail);
  });

  it('should block profile retrieval without session cookie', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/me`, {
      method: 'GET',
      headers,
    });

    expect(response.status).toBe(401);
  });

  it('should logout user successfully and clear session cookie', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    expect(response.status).toBe(200);
    const data: any = await response.json();
    expect(data.status).toBe('success');
  });
});
