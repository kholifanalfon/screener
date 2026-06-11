import { db } from '../../db';
import { users } from '../../db/generator';
import { eq } from 'drizzle-orm';

type NewUser = typeof users.$inferInsert;

export class AuthRepository {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async findById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async create(user: NewUser) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
}
