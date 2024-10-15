import {and, eq, isNull} from 'drizzle-orm';
import {DbService} from '../_core/services/dbService';
import {registrations} from '../schemas/registrations';

export async function registerGoogle(dbService: DbService, passId: string) {
  return await dbService
    .db()
    .insert(registrations)
    .values({
      passId,
    })
    .returning({
      id: registrations.id,
    });
}

export async function unregisterGoogle(dbService: DbService, passId: string) {
  const result = await dbService
    .db()
    .select({
      id: registrations.id,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.passId, passId),
        isNull(registrations.deviceId), // indicate it's a google registration
        isNull(registrations.deletedAt)
      )
    )
    .limit(1);

  if (result.length === 0) return;

  const activeReg = result[0];

  return await dbService
    .db()
    .update(registrations)
    .set({deletedAt: new Date()})
    .where(eq(registrations.id, activeReg.id));
}
