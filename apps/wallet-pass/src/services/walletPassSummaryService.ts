import {eq, or} from 'drizzle-orm';
import {DbService} from '../_core/services/dbService';
import {walletPasses} from '../schemas/walletPasses';
import {walletPassQueue} from '../schemas/walletPassQueue';

export async function getWalletPassById(dbService: DbService, id: string) {
  const results = await dbService
    .db()
    .select()
    .from(walletPasses)
    .where(eq(walletPasses.id, id))
    .limit(1);

  return results.length ? results[0] : undefined;
}

export async function getWalletPassStatusById(
  dbService: DbService,
  googleId: string,
  appleId: string
) {
  const results = await dbService
    .db()
    .select()
    .from(walletPassQueue)
    .where(
      or(eq(walletPassQueue.id, googleId), eq(walletPassQueue.id, appleId))
    )
    .limit(1);

  return results.length ? results : undefined;
}
