import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';
import {env} from '../src/env';

const connectionString = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`;
const sql = new Pool({connectionString});
const db = drizzle(sql);

migrate(db, {migrationsFolder: 'drizzle'}).then(() => sql.end());
