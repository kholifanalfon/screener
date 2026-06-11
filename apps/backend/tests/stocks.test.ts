import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { app } from '../src/index';
import { db } from '../src/db/index';
import { stocks } from '../src/db/generator/stocks';

let server: any;
const PORT = 3010;
const testEmail = `test-stocks-${Date.now()}@screener.com`;
const testPassword = 'password123';

const signature = process.env.BE_APP_SIGNATURE || '';
const headers = {
  'Content-Type': 'application/json',
  'x-app-signature': signature,
};

beforeAll(async () => {
  server = app.listen(PORT);

  // Register and Login to get session cookie
  await fetch(`http://localhost:${PORT}/api/v1/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      fullName: 'Stocks Tester',
    }),
  });
});

afterAll(() => {
  server.close();
});

describe('Stocks Integration Tests', () => {
  let sessionCookie = '';

  beforeAll(async () => {
    // Pastikan saham BBCA terdaftar di DB
    const existing = await db.query.stocks.findFirst({
      where: (s, { eq }) => eq(s.ticker, 'BBCA'),
    });

    if (!existing) {
      await db.insert(stocks).values({
        ticker: 'BBCA',
        name: 'Bank Central Asia Tbk',
        sector: 'Financials',
      });
    }

    // Login to get session token
    const response = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const cookieHeader = response.headers.get('set-cookie');
    if (cookieHeader) {
      sessionCookie = cookieHeader.split(';')[0];
    }
  });

  it('should block list stocks without authorization', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/stocks`, {
      method: 'GET',
      headers,
    });
    expect(response.status).toBe(401);
  });

  it('should list stocks successfully when authorized', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/stocks`, {
      method: 'GET',
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    expect(response.status).toBe(200);
    const data: any = await response.json();
    expect(data.status).toBe('success');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should get stock details successfully', async () => {
    // Cari ticker BBCA
    const response = await fetch(`http://localhost:${PORT}/api/v1/stocks/BBCA`, {
      method: 'GET',
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    expect(response.status).toBe(200);
    const data: any = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.ticker).toBe('BBCA');
    expect(data.data.indicators).toBeDefined();
    expect(Array.isArray(data.data.history)).toBe(true);
  });

  it('should return 404 for non-existent stock ticker', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/stocks/XYZ`, {
      method: 'GET',
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    expect(response.status).toBe(404);
  });

  it('should filter stocks using screener endpoint', async () => {
    const response = await fetch(`http://localhost:${PORT}/api/v1/stocks/screener?minRsi=10&maxRsi=90`, {
      method: 'GET',
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    expect(response.status).toBe(200);
    const data: any = await response.json();
    expect(data.status).toBe('success');
    expect(Array.isArray(data.data)).toBe(true);
  });
});
