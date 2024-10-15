import {and, eq, sql} from 'drizzle-orm';
import {DbService} from '../_core/services/dbService';
import {MAX_LIMIT} from '../constant';
import {walletPasses} from '../schemas/walletPasses';
import {walletPassQueue} from '../schemas/walletPassQueue';

export async function findBatchOfUndoneTasks(
  dbService: DbService,
  jobType: string,
  batchSize = MAX_LIMIT
) {
  return await dbService
    .db()
    .select()
    .from(walletPassQueue)
    .where(
      and(eq(walletPassQueue.jobType, jobType), eq(walletPassQueue.done, -1))
    )
    .orderBy(sql`random()`)
    .limit(batchSize);
}

export async function findBatchOfDoneTasks(
  dbService: DbService,
  jobType: string,
  batchSize = MAX_LIMIT
) {
  return await dbService
    .db()
    .select()
    .from(walletPassQueue)
    .where(
      and(eq(walletPassQueue.jobType, jobType), eq(walletPassQueue.done, 1))
    )
    .limit(batchSize);
}

export async function saveWalletPassResult(
  dbService: DbService,
  id: string,
  apiKey: string,
  result: any
) {
  return await dbService.db().transaction(async tx => {
    await tx
      .update(walletPassQueue)
      .set({done: 1})
      .where(eq(walletPassQueue.id, id));
    await tx
      .insert(walletPasses)
      .values({
        id,
        apiKey,
        result,
      })
      .onConflictDoUpdate({target: walletPasses.id, set: {result}});
  });
}

export async function saveWalletResultAndCleanTask(
  dbService: DbService,
  id: string,
  apiKey: string,
  result: any
) {
  return await dbService.db().transaction(async tx => {
    await tx.delete(walletPassQueue).where(eq(walletPassQueue.id, id));
    await tx
      .insert(walletPasses)
      .values({
        id,
        apiKey,
        result,
      })
      .onConflictDoUpdate({target: walletPasses.id, set: {result}});
  });
}

export async function deleteWalletPassTaskById(
  dbService: DbService,
  id: string
) {
  return await dbService
    .db()
    .delete(walletPassQueue)
    .where(eq(walletPassQueue.id, id));
}

export async function findWalletPassTaskById(dbService: DbService, id: string) {
  const result = await dbService
    .db()
    .select()
    .from(walletPassQueue)
    .where(eq(walletPassQueue.id, id))
    .limit(1);

  return result.length ? result[0] : undefined;
}

export async function updateWalletPassTaskParamsById(
  dbService: DbService,
  id: string,
  params: any
) {
  return await dbService
    .db()
    .update(walletPassQueue)
    .set({params})
    .where(eq(walletPassQueue.id, id));
}

export async function getPendingTasks(dbService: DbService) {
  const result = await dbService
    .db()
    .execute(
      sql`select count(1) as total, job_type from api_wallet_pass_queue group by job_type;`
    );

  return result.rows.reduce((tasksByType, group) => {
    tasksByType[`wallat_pass_${group.job_type}`] = group.total;
    return tasksByType;
  }, {});
}
