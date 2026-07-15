import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';

export function createPostgresSessionStore(pool) {
  const PgStore = connectPgSimple(session);
  return new PgStore({ pool, tableName: 'sessions', createTableIfMissing: false });
}
