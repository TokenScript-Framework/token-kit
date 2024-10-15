import {DrizzleConfig} from 'drizzle-orm';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import {Logger} from 'pino';
import {LOGGER} from '../constant';

export type PgOptions = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export class DbService {
  private readonly sql: Pool;
  private logger: Logger;

  constructor(opt: {pgOpts: PgOptions}) {
    this.sql = new Pool(opt.pgOpts);
    this.logger = LOGGER.child({from: 'DbService'});
  }

  async dispose() {
    this.logger.info('Closing database connection');
    return this.sql.end();
  }

  db(config?: DrizzleConfig) {
    return drizzle(this.sql, config);
  }
}
